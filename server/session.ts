import { cookie, base64, sha256 } from "./deps.ts";
import environment from "./environment.ts";

function jwt(payload: Record<string, string | number>) {
  const token = {
    header: base64.encode(
      new TextEncoder().encode(JSON.stringify({ alg: "HS256", typ: "JWT" }))
    ),
    payload: base64.encode(
      new TextEncoder().encode(
        JSON.stringify({
          exp: new Date(Date.now() + 604_800 * 1000),
          ...payload,
        })
      )
    ),
  };
  const data = `${token.header}.${token.payload}`;

  return `${data}.${new sha256.HmacSha256(environment.COOKIE_SESSION_KEY)
    .update(data)
    .toString()}`;
}

function verify(jwt: string) {
  if (!jwt) return undefined;

  const [header, payload, signature] = jwt.split(".");

  const sign = new sha256.HmacSha256(environment.COOKIE_SESSION_KEY)
    .update(`${header}.${payload}`)
    .toString();

  if (sign === signature) {
    const { exp, ...rest } = JSON.parse(
      new TextDecoder().decode(base64.decode(payload))
    );

    if (exp && Date.now() > exp) return;

    return rest;
  }

  return undefined;
}

export default {
  createSession(data: Record<string, string | number>) {
    const headers = new Headers();

    cookie.setCookie(headers, {
      name: "auth",
      value: jwt(data),
      expires: new Date(Date.now() + 604_800 * 1000),
      httpOnly: true,
      maxAge: 604_800,
      path: "/",
      sameSite: "Lax",
    });

    return headers.get("set-cookie");
  },
  readSession(request: Request) {
    const cookies = cookie.getCookies(request.headers);
    const payload = verify(cookies.auth);

    if (payload) {
      return payload;
    }

    return undefined;
  },
};
