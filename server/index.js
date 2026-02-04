/*
 * server/index.js
 *
 * Minimal example demonstrating how to use `server/database.js`.
 * Run this locally (not on GitHub Pages) to verify connectivity.
 *
 * Usage:
 *   cd server
 *   npm install
 *   node index.js
 */

const db = require('./database');

async function main() {
  console.log('Testing DB connection...');
  try {
    const res = await db.query('SELECT NOW() AS now');
    console.log('Connected. Server time:', res.rows[0].now);
  } catch (err) {
    console.error('DB test failed:', err.message || err);
  } finally {
    await db.closePool();
  }
}

main();
