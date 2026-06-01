import crypto from "crypto";
import nodemailer from "nodemailer";
import express from 'express';
import cors from 'cors';
import { Pool } from "pg";
import bcrypt from "bcrypt";
import session from 'express-session';
import passport from 'passport';
import { Strategy } from 'passport-local';
import GoogleStrategy from 'passport-google-oauth20';
import env from 'dotenv';
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const saltRounds = 10; // Number of salt rounds for bcrypt hashing

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
env.config();

//*****************Middleware setup************************************************
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.set("trust proxy", 1); // Couldn't login with google with it

//session should be initialized before passport.session() middleware
app.use(session({
  secret: process.env.SESSION_SECRET, // Use an environment variable for the session secret
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  },
}));
app.use(passport.initialize());
app.use(passport.session());
//**********************************************************************************

// Database connection pool setup
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  // user: process.env.PG_USER,
  // host: process.env.PG_HOST,
  // database: process.env.PG_DATABASE,
  // password: process.env.PG_PASSWORD,
  // port: process.env.PG_PORT,
});

//Nodemailer to send emails directly from your backend server
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  family: 4
});

// Passport Local Strategy for authentication
passport.use(new Strategy({ usernameField: 'email' }, async (email, password, cb) => {
  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email.toLowerCase()]);
    if (result.rows.length === 0) {
      return cb(null, false);
    }
    const user = result.rows[0];
    const storedHashPassword = user.password;
    const isMatch = await bcrypt.compare(password, storedHashPassword);
    if (!isMatch) {
      return cb(null, false);
    }
    return cb(null, user);
  } catch (err) {
    return cb(err);
  }
}));

//  Passport Google OAuth Strategy for authentication
passport.use("google", new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
}, async (accessToken, refreshToken, profile, cb) => {
  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [profile.emails[0].value]);
    if (result.rows.length === 0) {
      const newUser = await db.query("INSERT INTO users (email, password, recovery_email) VALUES($1, $2, $3) RETURNING *",
        [profile.emails[0].value.toLowerCase(), "google", profile.emails[0].value.toLowerCase()]);
      return cb(null, newUser.rows[0]);
    } else {
      return cb(null, result.rows[0]);
    }
  } catch (err) {
    return cb(err);
  }
}));

// putting data in the session
passport.serializeUser((user, cb) => {
  cb(null, user.email.toLowerCase());   // store only email
});

// retrieving the user data from the session
passport.deserializeUser(async (email, cb) => {
  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email.toLowerCase()]);
    cb(null, result.rows[0]);
  } catch (err) {
    cb(err);
  }
});

//********************GET ROUTES ************************************************************ */
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/secrets', passport.authenticate('google',
  {
    successRedirect: process.env.FRONTEND_URL + '/userPortal',
    failureRedirect: process.env.FRONTEND_URL

  }));

// Getting the user info from the database and sending it to the frontend
app.get('/userInfo', async (req, res) => {
  try {
    const response = await db.query("SELECT * FROM users");
    res.send(response.rows);
  } catch (error) {
    console.log(error);
  }
});

// A protected route that checks if the user is authenticated from the session before sending the user info
app.get("/secret", async (req, res) => {
  if (req.isAuthenticated()) {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [req.user.email.toLowerCase()]);
    return res.send({ loggedIn: true, user: req.user, secret: result.rows[0].secret });
  }
  res.send({ loggedIn: false });
});


// A route to Log out
app.get('/logout', (req, res) => {
  req.logout(err => {
    if (err) {
      console.log(err);
    } else {
      res.send("logout");
    }
  });
});

//********************POST ROUTES ************************************************************ */

// Hashing the password and storing the user info in the database
app.post('/signup', async (req, res) => {
  try {
    const { email, password, recoveryEmail } = req.body;
    //Password Hashing using bcrypt
    bcrypt.hash(password, saltRounds, async (err, hash) => {
      if (err) {
        console.log("Error hashing password:", err);
      } else {
        const userInfo = await db.query(
          "INSERT INTO users (email, password, recovery_email) VALUES($1, $2, $3) RETURNING *",
          [email.toLowerCase(), hash, recoveryEmail.toLowerCase()]
        );
        res.send(userInfo.rows);
      }
    });
  } catch (error) {
    console.log(error);
  }
});

// Authenticating the user using passport local strategy and creating a session for the authenticated user
app.post('/login', (req, res, next) => {
  passport.authenticate("local", (err, user) => {
    if (err) return next(err);
    if (!user) return res.send({ name: "Incorrect username or password!" });
    req.logIn(user, err => {
      if (err) return next(err);
      return res.send(user);
    });
  })(req, res, next);
});

app.post('/secretText', async (req, res) => {
  const { user, secretText } = req.body;
  const result = await db.query(
    "UPDATE users SET secret = $1 WHERE email = $2 RETURNING secret", [secretText, user.email.toLowerCase()]
  );
  res.send(result.rows[0]);
});


//***********Reset Password**********************************
app.post("/reset-password", async (req, res) => {
  const { email, recoveryEmail } = req.body;

  try {
    // 1. Check if user exists
    const result = await db.query(
      "SELECT * FROM users WHERE email = $1 AND recovery_email = $2",
      [email.toLowerCase(), recoveryEmail.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(404).send({ message: "Email and recovery email do not match" });
    }

    // 2. Generate token + expiry
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = Date.now() + 1000 * 60 * 15; // (1000 millisec is 1second * 60 seconds * 15) = 15 minutes

    await db.query(
      "UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3 AND recovery_email = $4",
      [token, expiry, email.toLowerCase(), recoveryEmail.toLowerCase()]
    );

    // 3. Create reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    // 4. Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: recoveryEmail.toLowerCase(),
      subject: "Password Reset",
      html: `
        <p>You requested a password reset.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
      `,
    });

    // 5. Respond to frontend
    res.send({ message: "Reset link sent to your recovery email" });

  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Server error" });
  }
});

app.post("/update-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const result = await db.query(
      "SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > $2",
      [token, Date.now()]
    );

    if (result.rows.length === 0) {
      return res.status(400).send({ message: "Invalid or expired token" });
    }

    const email = result.rows[0].email;
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE email = $2",
      [hashedPassword, email.toLowerCase()]
    );

    res.send({ message: "Password updated successfully" });
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).send({ message: "Server error" });
  }
});


//*****************localhost server************************************
// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
