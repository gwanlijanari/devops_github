const http = require("http");
const { Pool } = require("pg");

const port = Number(process.env.PORT || 8000);
const role = process.env.ROLE || "web";
const apiUrl = process.env.API_URL || "http://api:8000";
const appName = process.env.APP_NAME || "demo";

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectionTimeoutMillis: 5000,
});

async function startApi() {
  await pool.query(
    "CREATE TABLE IF NOT EXISTS requests (" +
      "id SERIAL PRIMARY KEY, created_at TIMESTAMP DEFAULT NOW())",
  );
  http
    .createServer(async (req, res) => {
      if (req.url === "/health") {
        res.writeHead(200);
        res.end("ok\n");
        return;
      }
      if (req.url === "/" && req.method === "POST") {
        const r = await pool.query(
          "INSERT INTO requests DEFAULT VALUES RETURNING id",
        );
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ id: r.rows[0].id }));
        return;
      }
      if (req.url === "/requests" && req.method === "GET") {
        const r = await pool.query("SELECT id FROM requests ORDER BY id");
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(r.rows));
        return;
      }
      res.writeHead(404);
      res.end("Not found\n");
    })
    .listen(port, "0.0.0.0", () => console.log("API on " + port));
}

function startWeb() {
  http
    .createServer(async (req, res) => {
      if (req.url === "/health") {
        res.writeHead(200);
        res.end("ok\n");
        return;
      }
      if (req.url === "/" && req.method === "GET") {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(`<h1>${appName}</h1>
        <form method="POST" action="/create">
          <button type="submit">Создать заявку</button>
        </form>
        <a href="/list">Список заявок</a>`);
        return;
      }
      if (req.url === "/create" && req.method === "POST") {
        const r = await fetch(apiUrl + "/", { method: "POST" });
        const data = await r.json();
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(`Создана заявка №${data.id}. <a href="/">Назад</a>`);
        return;
      }
      if (req.url === "/list") {
        const r = await fetch(apiUrl + "/requests");
        const list = await r.json();
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(
          `<h1>Заявки</h1><ul>${list
            .map((x) => `<li>№${x.id}</li>`)
            .join("")}</ul><a href="/">Назад</a>`,
        );
        return;
      }
      res.writeHead(404);
      res.end("Not found\n");
    })
    .listen(port, "0.0.0.0", () => console.log("WEB on " + port));
}

role === "api"
  ? startApi().catch((e) => {
      console.error(e);
      process.exit(1);
    })
  : startWeb();
