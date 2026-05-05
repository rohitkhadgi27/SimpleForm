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
env.config({ path: path.join(__dirname, "../.env") });

//*****************Middleware setup************************************************
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
//session should be initialized before passport.session() middleware
app.use(session({
  secret: process.env.SESSION_SECRET, // Use an environment variable for the session secret
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  },
}));
app.use(passport.initialize());
app.use(passport.session());
//**********************************************************************************

// Database connection pool setup
const db = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
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
  callbackURL: "http://localhost:5000/auth/google/secrets",
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
}, async (accessToken, refreshToken, profile, cb) => {
  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [profile.emails[0].value]);
    if (result.rows.length === 0) {
      const newUser = await db.query("INSERT INTO users (email, password) VALUES($1, $2) RETURNING *", [profile.emails[0].value, "google"]);
      return cb(null, newUser);
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
    successRedirect: 'http://localhost:5173/userPortal',
    failureRedirect: 'http://localhost:5173'
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
app.get("/secret", (req, res) => {
  if (req.isAuthenticated()) {
    return res.send({ loggedIn: true, user: req.user });
  }
  res.send({ loggedIn: false });
});

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

app.listen(5000, () => {
  console.log(`Server running on http://localhost:5000`);
});

