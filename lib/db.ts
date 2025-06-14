import { sql } from '@vercel/postgres';

// Database connection using Vercel Postgres
export const db = sql;

// Alternative connection using pg library
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export { pool };

// Test database connection
export async function testConnection() {
  try {
    const result = await sql`SELECT NOW() as current_time`;
    console.log('Database connected successfully:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Example query function
export async function executeQuery(query: string, params: any[] = []) {
  try {
    const client = await pool.connect();
    const result = await client.query(query, params);
    client.release();
    return result;
  } catch (error) {
    console.error('Query execution failed:', error);
    throw error;
  }
}