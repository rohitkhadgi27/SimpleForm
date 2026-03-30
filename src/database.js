import { Pool } from "pg";

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "react hook form",
  password: "Guit@r1649",
  port: 5432,
});

export default pool;
