import { Pool, type QueryResultRow } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __satriaPool: Pool | undefined;
}

function createPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL belum di-set. Salin .env.example ke .env.local lalu isi kredensial PostgreSQL.",
    );
  }

  const isLocal = /localhost|127\.0\.0\.1/.test(connectionString);

  return new Pool({
    connectionString,
    max: 10,
    ssl: isLocal ? undefined : { rejectUnauthorized: false },
  });
}

export function getPool() {
  if (!global.__satriaPool) {
    global.__satriaPool = createPool();
  }
  return global.__satriaPool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
) {
  return getPool().query<T>(text, params);
}
