const cache: Record<string, Uint8Array> = {};

try {
  const index = await Deno.readFile("./public/index.html");
  const dir = await Deno.readDir("./public/assets");

  cache.index = index;

  for await (const file of dir) {
    cache[`/assets/${file.name}`] = await Deno.readFile(
      `./public/assets/${file.name}`
    );
  }
} catch (error) {}

export default cache;
