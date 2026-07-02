/**
 * MySQL connection pool. One module owns the pool; every other caller goes
 * through `query` / `queryOne` / `exec`. No ORM — schema is small, queries are
 * explicit, and we keep migrations in plain SQL (`db/schema.sql`).
 *
 * Connection target is the Syskay cPanel MySQL instance. Because Vercel
 * egress IPs are not stable, the DB host needs either (a) a Syskay cPanel
 * "Remote MySQL" wildcard that permits Vercel, or (b) a static-IP tunnel. See
 * docs on README for deployment setup.
 */

import mysql, { type Pool, type RowDataPacket, type ResultSetHeader } from "mysql2/promise";

let _pool: Pool | null = null;

function getPool(): Pool {
  if (_pool) return _pool;

  const host = process.env.MYSQL_HOST;
  const user = process.env.MYSQL_USER;
  const password = process.env.MYSQL_PASSWORD;
  const database = process.env.MYSQL_DATABASE;

  if (!host || !user || !password || !database) {
    throw new Error(
      "MySQL env missing: set MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE",
    );
  }

  _pool = mysql.createPool({
    host,
    user,
    password,
    database,
    port: Number(process.env.MYSQL_PORT ?? 3306),
    // cPanel tends to enforce low per-user connection caps. 10 is generous
    // for a single Vercel deployment; raise only if you see queueing.
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
    // Optional TLS for managed MySQL that supports it. Leave disabled on
    // stock cPanel (which typically doesn't terminate SSL on 3306).
    ssl: process.env.MYSQL_SSL === "true" ? { rejectUnauthorized: true } : undefined,
    // JSON columns return as strings in some driver configs; force parse.
    typeCast: true,
    dateStrings: false,
  });

  return _pool;
}

/** Live check for whether MySQL is configured. Call sites use this to decide
 *  between real data and the dev stubs in `lib/data.ts`. */
export function isDbConfigured(): boolean {
  return Boolean(
    process.env.MYSQL_HOST &&
      process.env.MYSQL_USER &&
      process.env.MYSQL_PASSWORD &&
      process.env.MYSQL_DATABASE,
  );
}

/** Values mysql2 accepts as prepared-statement params. */
export type ParamValue = string | number | bigint | boolean | Date | Buffer | null;

/** SELECT → rows. */
export async function query<T extends RowDataPacket>(
  sql: string,
  params: ReadonlyArray<ParamValue> = [],
): Promise<T[]> {
  // .query() (text protocol, client-escaped placeholders), not .execute()
  // (binary prepared statements) — mysql2's binary protocol mishandles
  // LIMIT/OFFSET placeholder types against MySQL 8.4+/9.x, throwing
  // "Incorrect arguments to mysqld_stmt_execute". .query() still escapes
  // `?` params safely, it just skips the prepared-statement path.
  const [rows] = await getPool().query<T[]>(sql, params as ParamValue[]);
  return rows;
}

/** SELECT → first row or null. */
export async function queryOne<T extends RowDataPacket>(
  sql: string,
  params: ReadonlyArray<ParamValue> = [],
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

/** INSERT / UPDATE / DELETE. Returns insertId + affectedRows. */
export async function exec(
  sql: string,
  params: ReadonlyArray<ParamValue> = [],
): Promise<{ insertId: number; affectedRows: number }> {
  const [result] = await getPool().query<ResultSetHeader>(sql, params as ParamValue[]);
  return { insertId: result.insertId, affectedRows: result.affectedRows };
}
