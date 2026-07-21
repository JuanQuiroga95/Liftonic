require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  try {
    const res = await pool.query('SELECT column_name FROM information_schema.columns WHERE table_name = $1', ['exercises']);
    console.log("Exercises columns:", res.rows.map(r => r.column_name));
    
    // Attempt migrations
    await pool.query(`
      ALTER TABLE exercises 
      ADD COLUMN IF NOT EXISTS description TEXT,
      ADD COLUMN IF NOT EXISTS variation VARCHAR(255);
    `);
    
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;
    `);

    await pool.query(`
      ALTER TABLE daily_exercises 
      ADD COLUMN IF NOT EXISTS sets JSONB DEFAULT '[]'::jsonb;
    `);
    
    console.log("Migrations ran successfully via script!");
  } catch (e) {
    console.error("Error:", e);
  } finally {
    pool.end();
  }
}

check();
