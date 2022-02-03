import { pg } from "./deps.ts";
import type { QueryObjectResult } from "./types.ts";
import environment from "./environment.ts";

const url = new URL(environment.DATABASE_URL);

const client = new pg.Client({
  user: url.username,
  hostname: url.hostname,
  database: url.pathname.substring(1),
  password: url.password,
  port: Number(url.port),
});

await client.connect();

export type QueryFunction = <T>(
  query: string,
  args?: Record<string, unknown> | unknown[] | undefined
) => Promise<QueryObjectResult<T>>;

const query: QueryFunction = <T>(
  query: string,
  args: Record<string, unknown> | unknown[] | undefined
) => client.queryObject<T>(query, args);

export default query;
