import { Hono } from "hono";

type HonoContext = {
  Bindings: {
    rpc_url: string;
  };
};

type LatestBlockhashResponse = {
  result: {
    value: {
      blockhash: string;
    };
  };
};

const app = new Hono<HonoContext>();

export default {
  async fetch(request, env, ctx) {
    const cacheUrl = new URL(request.url);

    // Construct the cache key from the cache URL
    const cacheKey = new Request(cacheUrl.toString(), request);
    const cache = caches.default;

    // Check whether the value is already available in the cache
    // if not, you will need to fetch it from origin, and store it in the cache
    let response = await cache.match(cacheKey);

    if (!response) {
      console.log(`Response for request url: ${request.url} not present in cache. Fetching and caching request.`);
      response = await writeIntoCache(request, env, ctx, cache, cacheKey, response);
    } else {
      console.log(`Cache hit for: ${request.url}.`);
    }
    return response;
  },
} satisfies ExportedHandler;

async function writeIntoCache(request: Request, env: unknown, ctx: ExecutionContext, cache: Cache, cacheKey: Request, response: Response | undefined) {
  // If not in cache, get it from origin
  response = await app.fetch(request, env as {}, ctx);

  // Must use Response constructor to inherit all of response's fields
  response = new Response(response.body, response);

  // Cache API respects Cache-Control headers. Setting s-max-age to 10
  // will limit the response to be in cache for 10 seconds max

  // Any changes made to the response here will be reflected in the cached value
  response.headers.append("Cache-Control", "s-maxage=10");

  ctx.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
}

app.get("/blockhash", async (c) => {
  const recentBlockhash: LatestBlockhashResponse = await fetch(`${c.env.rpc_url}`, {
    method: "POST",
    body: JSON.stringify({
      id: 1,
      jsonrpc: "2.0",
      method: "getLatestBlockhash",
      params: [
        {
          commitment: "confirmed",
        },
      ],
    }),
    headers: {
      "cache-control": "no-cache",
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());

  return c.json({ recentBlockhash: recentBlockhash.result.value.blockhash });
});
