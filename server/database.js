/*
 * server/database.js
 *
 * Small Node.js module that reads DB credentials from environment variables
 * and exposes a safe `query()` helper using the `pg` Pool.
 *
 * Best practices implemented:
 * - Do not hard-code credentials; read from `process.env` (supported by `.env` during development)
 * - Use a singleton connection pool
 * - Support SSL when `DB_SSL` is enabled
 * - Load `dotenv` only in non-production environments
 */

const fs = require('fs');
const { Pool } = require('pg');

if (process.env.NODE_ENV !== 'production') {
  // Load local .env when available (development only)
  try { require('dotenv').config(); } catch (e) {}
}

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || undefined,
  password: process.env.DB_PASSWORD || undefined,
  max: 10,
  idleTimeoutMillis: 30000,
};

// Configure SSL if requested (DB_SSL=true)
if (process.env.DB_SSL && String(process.env.DB_SSL).toLowerCase() === 'true') {
  const sslConfig = { rejectUnauthorized: true };
  if (process.env.RDS_CA && fs.existsSync(process.env.RDS_CA)) {
    sslConfig.ca = fs.readFileSync(process.env.RDS_CA).toString();
  }
  if (process.env.DB_SSL_REJECT_UNAUTHORIZED === 'false') {
    sslConfig.rejectUnauthorized = false;
  }
  dbConfig.ssl = sslConfig;
}

let pool;
function getPool() {
  if (!pool) {
    pool = new Pool(dbConfig);
    pool.on('error', (err) => {
      console.error('Unexpected idle client error', err);
    });
  }
  return pool;
}

/**
 * Query helper
 * @param {string} text - SQL query text
 * @param {Array} params - query parameters
 * @returns {Promise<import('pg').QueryResult>}
 */
async function query(text, params = []) {
  const p = getPool();
  const client = await p.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release();
  }
}

/**
 * Graceful shutdown helper
 */
async function closePool() {
  if (pool) {
    try {
      await pool.end();
      pool = null;
    } catch (e) {
      console.error('Error closing DB pool', e);
    }
  }
}

module.exports = { getPool, query, closePool };
