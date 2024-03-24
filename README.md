# sol-cache

This is a very simple API to cache frequently used data such as blockhashes to safe RPC calls. It is built using Cloudflare Workers and deployed to the Cloudflare Edge network for lowest possible latency.

Currently supported:

- `getLatestBlockhash`

## Setup

1. Make sure wrangler is installed: `bun install wrangler`
2. Login to Cloudflare: `bunx wrangler login`
3. Set your RPC URL: `bunx wrangler secret put rpc_url`
4. Install dependencies: `bun install`

## Configuration

You need to create a `.dev.vars` file in the root of the project. Copy the contetns of `.vars.example` and modify the values as needed.

## Local Development

```
bun run dev
```

## Deploy to Cloudflare Workers:

```
bun run deploy
```
