import { streams } from "./deps.ts";

export async function parseBody(request: Request) {
  const reader = request.body?.getReader();
  const size = Number(request.headers.get("Content-Length"));
  const result = new Uint8Array(size);

  if (reader) {
    const { read } = streams.readerFromStreamReader(reader);

    let bytes = size;

    while (bytes) {
      bytes -= (await read(result)) || 0;
    }
  }

  return JSON.parse(new TextDecoder().decode(result));
}
