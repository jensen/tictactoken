import session from "./session.ts";
import { upgrade, emit } from "./websocket.ts";
import type { QueryFunction } from "./db.ts";
import cache from "./static.ts";

interface IContext {
  db: QueryFunction;
  emit: (id: string, data: string) => void;
  user?: any;
}

export type CallbackHandler = (
  request: Request,
  params: Record<string, string>,
  context: IContext
) => Promise<Response>;

interface IRoute {
  handler: CallbackHandler;
  pattern: URLPattern;
  auth: boolean;
}

export default class Router {
  private routes: Record<string, Array<IRoute>> = {
    GET: [],
    POST: [],
    PUT: [],
  };

  private context: IContext;

  constructor(context: IContext) {
    this.context = context;
  }

  public(method: string, pathname: string, handler: CallbackHandler) {
    this.routes[method.toUpperCase()].push({
      handler,
      pattern: new URLPattern({ pathname }),
      auth: false,
    });
  }

  private(method: string, pathname: string, handler: CallbackHandler) {
    this.routes[method.toUpperCase()].push({
      handler,
      pattern: new URLPattern({ pathname }),
      auth: true,
    });
  }

  private auth(request: Request) {
    return session.readSession(request);
  }

  async use(request: Request): Promise<Response> {
    const websocket = upgrade(request);

    if (websocket) {
      return websocket;
    }

    const { pathname } = new URL(request.url);

    if (pathname === "/") {
      const file = cache.index;

      return new Response(file, {
        headers: {
          "content-type": "text/html",
        },
      });
    }

    if (pathname.startsWith("/assets")) {
      const file = cache[pathname];
      const type = pathname.endsWith("js")
        ? "text/javascript"
        : pathname.endsWith("css")
        ? "text/css"
        : "text/plain";

      return new Response(file, {
        headers: {
          "content-type": type,
        },
      });
    }

    for (const { pattern, handler, auth } of this.routes[
      request.method.toUpperCase()
    ]) {
      if (pattern.test(request.url)) {
        // @ts-ignore No idea why pattern is possible `null` on the next line
        const params = pattern.exec(request.url).pathname.groups;

        if (auth) {
          const user = this.auth(request);

          if (user) {
            return await handler(request, params, { ...this.context, user });
          } else {
            return new Response("", {
              status: 401,
              headers: new Headers({
                "WWW-Authenticate": "cookie; cookie-name=auth",
              }),
            });
          }
        }

        return await handler(request, params, this.context);
      }
    }

    const file = cache.index;

    return new Response(file, {
      headers: {
        "content-type": "text/html",
      },
    });
  }
}
