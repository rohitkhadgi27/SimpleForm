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
env.config({ path: path.join(__dirname, ".env") });

//*****************Middleware setup************************************************
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
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

// Passport Local Strategy for authentication
passport.use(new Strategy({ usernameField: 'email' }, async (email, password, cb) => {
  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
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
      const newUser = await db.query("INSERT INTO users (email, password) VALUES($1, $2) RETURNING *", [profile.emails[0].value, "google"]);
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
  return cb(null, user);
});

// retrieving the user data from the session
passport.deserializeUser((user, cb) => {
  return cb(null, user);
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
    const result = await db.query("SELECT * FROM users WHERE email = $1", [req.user.email]);
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
    const { email, password } = req.body;
    //Password Hashing using bcrypt
    bcrypt.hash(password, saltRounds, async (err, hash) => {
      if (err) {
        console.log("Error hashing password:", err);
      } else {
        const userInfo = await db.query(
          "INSERT INTO users (email, password) VALUES($1, $2) RETURNING *",
          [email, hash]
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
    "UPDATE users SET secret = $1 WHERE email = $2 RETURNING secret", [secretText, user.email]
  );
  res.send(result.rows[0]);
});

//*****************localhost server************************************
// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
