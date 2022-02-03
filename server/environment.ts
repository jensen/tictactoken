import "https://deno.land/x/dotenv@v3.1.0/load.ts";

const allowed = [
  "DATABASE_URL",
  "DISCORD_CLIENT_ID",
  "DISCORD_CLIENT_SECRET",
  "DISCORD_REDIRECT_URI",
  "COOKIE_SESSION_KEY",
  "PORT",
];
const all = Deno.env.toObject();

const environment = allowed.reduce((env: { [key: string]: string }, key) => {
  env[key] = all[key];
  return env;
}, {});

export default environment;
