const http = require('http');
const { Pool } = require('pg');

const port = Number(process.env.PORT || 3000);
const appName = process.env.APP_NAME || 'demo';
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectionTimeoutMillis: 5000
});
pool.on('error', (err) => {
  console.error('POOL_ERROR', err.message);
});

async function main() {
  await pool.query(
    'CREATE TABLE IF NOT EXISTS counter (' +
    'id INTEGER PRIMARY KEY, total INTEGER NOT NULL)'
  );
  const server = http.createServer(async (req, res) => {
    if (req.url !== '/') {
      res.writeHead(404);
      res.end('Not found\n');
      return;
    }
    try {
      const result = await pool.query(
        'INSERT INTO counter (id, total) VALUES (1, 1) ' +
        'ON CONFLICT (id) DO UPDATE ' +
        'SET total = counter.total + 1 RETURNING total'
      );
      const total = result.rows[0].total;
      console.log('GET / visits=' + total);
      res.writeHead(200, {
        'Content-Type': 'text/plain; charset=utf-8'
      });
      res.end('Visits: ' + total + ' | ' + appName + '\n');
    } catch (err) {
      console.error('DB_ERROR', err.code, err.message);
      res.writeHead(503);
      res.end('Database unavailable\n');
    }
  });
  server.listen(port, '0.0.0.0', () => {
    console.log('Listening on ' + port);
  });
}
main().catch((err) => {
  console.error('STARTUP_ERROR', err.code, err.message);
  process.exit(1);
});
