import { CallbackHandler } from "./router.ts";

import { json } from "./response.ts";
import { parseBody } from "./request.ts";

export const getGames: CallbackHandler = async (request, params, context) => {
  const { rows } = await context.db(`
  select
    games.id,
    json_build_object('id', host.id, 'username', host.username, 'avatar', host.avatar) as host,
    case when guest.id is null
    then null
    else json_build_object('id', guest.id, 'username', guest.username, 'avatar', guest.avatar)
    end as guest
  from games
  left join users as host on games.host_id = host.id
  left join users as guest on games.guest_id = guest.id
  group by games.id, host.id, guest.id
  `);

  return json(rows);
};

export const getGame: CallbackHandler = async (request, params, context) => {
  const {
    rows: [game],
  } = await context.db<{ id: string }>(
    `
    select
      games.id,
      json_build_object('id', host.id, 'username', host.username, 'avatar', host.avatar) as host,
      case when guest.id is null
      then null
      else json_build_object('id', guest.id, 'username', guest.username, 'avatar', guest.avatar)
      end as guest,
      games.host_id,
      games.guest_id,
      games.x,
      games.state,
      games.winner
    from games
    left join users as host on games.host_id = host.id
    left join users as guest on games.guest_id = guest.id
    where games.id = $id
    group by games.id, host.id, guest.id
    `,
    {
      id: params.id,
    }
  );

  return json(game);
};

export const getWinner = (state: Array<null | "x" | "o">) => {
  if (state[0] && state[0] === state[1] && state[1] === state[2]) {
    return state[0];
  }

  if (state[3] && state[3] === state[4] && state[4] === state[5]) {
    return state[3];
  }

  if (state[6] && state[6] === state[7] && state[7] === state[8]) {
    return state[6];
  }

  if (state[0] && state[0] === state[3] && state[3] === state[6]) {
    return state[0];
  }

  if (state[1] && state[1] === state[4] && state[4] === state[7]) {
    return state[1];
  }

  if (state[2] && state[2] === state[5] && state[5] === state[8]) {
    return state[2];
  }

  if (state[0] && state[0] === state[4] && state[4] === state[8]) {
    return state[0];
  }

  if (state[2] && state[2] === state[4] && state[4] === state[6]) {
    return state[2];
  }

  return null;
};

export const takeTurn: CallbackHandler = async (request, params, context) => {
  const body = await parseBody(request);
  const {
    rows: [game],
  } = await context.db<{
    id: string;
    state: Array<null | "x" | "o">;
    host_id: string;
    guest_id: string;
    x: string;
    winner: string;
  }>(`select * from games where id = $id`, {
    id: params.id,
  });

  const info = {
    x: game.state.filter((v) => v === "x").length,
    o: game.state.filter((v) => v === "o").length,
  };

  if (game.winner) return json({});
  if (game.state[body.index] !== null) return json({});

  const turn = info.x <= info.o ? "x" : "o";
  const state = game.state.map((v, i) => (i === body.index ? turn : v));

  if (turn === "x" && game.x !== context.user.id) return json({});
  if (turn === "o" && game.x === context.user.id) return json({});

  const winner = getWinner(state);
  const players = {
    x: game.x === game.host_id ? game.host_id : game.guest_id,
    o: game.x === game.host_id ? game.guest_id : game.host_id,
  };

  const {
    rows: [updated],
  } = await context.db(
    `
    with updated as (
      update games set state = $state, winner = $winner where id = $id returning *
    )
    select
      updated.id,
      json_build_object('id', host.id, 'username', host.username, 'avatar', host.avatar) as host,
      json_build_object('id', guest.id, 'username', guest.username, 'avatar', guest.avatar) as guest,
      updated.host_id,
      updated.guest_id,
      updated.x,
      updated.state,
      updated.winner
    from updated
    left join users as host on updated.host_id = host.id
    left join users as guest on updated.guest_id = guest.id
    `,
    {
      state: JSON.stringify(state),
      id: params.id,
      winner: winner && players[winner],
    }
  );

  context.emit(game.id, JSON.stringify(updated));

  return json({
    state,
  });
};

export const createGame: CallbackHandler = async (request, params, context) => {
  const {
    rows: [game],
  } = await context.db<{ id: string }>(
    `
    with inserted as (
      insert into games (host_id, state) values ($host_id, '[null,null,null,null,null,null,null,null,null]') returning *
    )
    select inserted.id, json_build_object('id', host.id, 'username', host.username, 'avatar', host.avatar) as host,
      case when guest.id is null
      then null
      else json_build_object('id', guest.id, 'username', guest.username, 'avatar', guest.avatar)
      end as guest
    from inserted
    left join users as host on inserted.host_id = host.id
    left join users as guest on inserted.guest_id = guest.id
    group by inserted.id, host.id, guest.id
    `,
    { host_id: context.user.id }
  );

  context.emit("list", JSON.stringify(game));

  return json(game);
};

export const joinGame: CallbackHandler = async (request, params, context) => {
  const {
    rows: [game],
  } = await context.db<{}>(
    `
    with updated as (
      update games
      set guest_id = $guest_id,
          x = case round(random())
              when 0 then games.host_id::uuid
              when 1 then $guest_id::uuid
              end
      where id = $id and host_id <> $guest_id and guest_id is null returning *
    )
    select
      updated.id,
      json_build_object('id', host.id, 'username', host.username, 'avatar', host.avatar) as host,
      json_build_object('id', guest.id, 'username', guest.username, 'avatar', guest.avatar) as guest
    from updated
    left join users as host on updated.host_id = host.id
    left join users as guest on updated.guest_id = guest.id
    group by updated.id, host.id, guest.id
    `,
    { guest_id: context.user.id, id: params.id }
  );

  if (game) {
    context.emit("list", JSON.stringify(game));
    return json(game);
  }

  return json({});
};
