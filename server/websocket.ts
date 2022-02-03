const sockets: Record<string, WebSocket[]> = {
  list: [],
};

export const emit = (id: string, data: string) => {
  for (const socket of sockets[id]) {
    socket.send(data);
  }
};

export const upgrade = (request: Request) => {
  if (request.headers.get("upgrade") === "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(request);
    const url = new URL(request.url);
    const id = url.pathname.substring(1);

    if (sockets[id] === undefined) {
      sockets[id] = [];
    }

    sockets[id].push(socket);

    socket.onclose = () => {
      sockets[id] = sockets[id].filter((s) => socket !== s);
    };

    socket.onerror = (error) => console.error("WebSocket error:", error);

    return response;
  }

  return null;
};
