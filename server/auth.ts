import type { CallbackHandler } from "./router.ts";
import session from "./session.ts";
import environment from "./environment.ts";

export const auth: CallbackHandler = async (request, params) => {
  const url = new URL(
    `https://discord.com/api/oauth2/authorize?${new URLSearchParams({
      response_type: "code",
      client_id: environment.DISCORD_CLIENT_ID,
      scope: "identify email",
      redirect_uri: environment.DISCORD_REDIRECT_URI,
    }).toString()}`
  );

  return Response.redirect(url.toString());
};

export const token: CallbackHandler = async (request, params, context) => {
  const code = new URL(request.url).searchParams.get("code");

  if (!code) return new Response(null, { status: 401 });

  const body = new URLSearchParams({
    client_id: environment.DISCORD_CLIENT_ID,
    client_secret: environment.DISCORD_CLIENT_SECRET,
    grant_type: "authorization_code",
    code,
    redirect_uri: environment.DISCORD_REDIRECT_URI,
  });

  const token = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    body: body.toString(),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const { access_token, expires_in, refresh_token } = await token.json();

  const discord = await fetch("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  const { id, username, email, avatar } = await discord.json();

  const {
    rows: [user],
  } = await context.db<{
    id: string;
  }>(
    `
    insert into
    users (provider_id, username, email, avatar)
    values ($provider_id, $username, $email, $avatar)
    on conflict (provider_id)
    do update set
      username = $username,
      email = $email,
      avatar = $avatar
    where users.provider_id = $provider_id returning *
    `,
    {
      provider_id: id,
      username,
      email,
      avatar: avatar
        ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`
        : null,
    }
  );

  const cookie = session.createSession({
    id: user.id,
  });

  if (!cookie) throw new Error("Could not create cookie");

  return new Response(null, {
    status: 301,
    headers: {
      Location: "/",
      "Set-Cookie": cookie,
    },
  });
};
