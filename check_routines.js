const fs = require('fs');
const { Pool } = require('pg');

const envFile = fs.readFileSync('.env.local', 'utf-8');
let dbUrl = '';
envFile.split('\n').forEach(line => {
  if (line.startsWith('DATABASE_URL=')) {
    dbUrl = line.split('=')[1].trim().replace(/['"]/g, '');
  }
});

const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  try {
    const res = await pool.query("SELECT id, title, student_id, professor_id, start_date, end_date FROM routines ORDER BY created_at DESC LIMIT 5");
    console.log("Recent routines:");
    console.table(res.rows);

    const users = await pool.query("SELECT id, username, role FROM users");
    console.log("Users:");
    console.table(users.rows);

  } catch (e) {
    console.error("Error:", e);
  } finally {
    pool.end();
  }
}

check();
