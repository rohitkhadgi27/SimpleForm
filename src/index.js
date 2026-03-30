import express from 'express';
import cors from 'cors';
import pool from './database.js';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/signup', async (req, res) => {
  try {
    const { userName, userPassword } = req.body;
    const userInfo = await pool.query(
      "INSERT INTO users (name, password) VALUES($1, $2) RETURNING *",
      [userName, userPassword]
    );
    res.send(userInfo.rows);
  } catch (error) {
    console.log(error);
  }
});

app.get('/userInfo', async (req, res) => {
  try { 
    const response = await pool.query("SELECT * FROM users");  
    res.send(response.rows);
  } catch (error) {
    console.log(error);
  }
});

app.listen(5000, () => {
  console.log(`Server running on http://localhost:$5000`);
});

