import environment from "./environment.ts";
import { server } from "./deps.ts";
import Router from "./router.ts";
import db from "./db.ts";
import { emit } from "./websocket.ts";
import { json } from "./response.ts";
import { auth, token } from "./auth.ts";
import {
  getGames,
  getGame,
  createGame,
  joinGame,
  takeTurn,
} from "./handlers.ts";

const router = new Router({ db, emit });

router.public("GET", "/auth/discord/auth", auth);
router.public("GET", "/auth/discord/token", token);

router.public("GET", "/api/games", getGames);
router.public("GET", "/api/games/:id", getGame);

router.private("POST", "/api/games", createGame);
router.private("POST", "/api/games/:id/join", joinGame);
router.private("POST", "/api/games/:id/turn", takeTurn);

router.private("GET", "/api/me", async (request, params, context) => {
  const {
    rows: [user],
  } = await context.db<{ id: string }>(
    `select id, username, avatar from users where id = $id`,
    {
      id: context.user.id,
    }
  );

  return json(user);
});

await server.serve(async (request: Request) => await router.use(request), {
  port: Number(environment.PORT),
});
