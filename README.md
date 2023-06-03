## GraphQL CDN Cloudflare Worker Experiment

This experiment is a lightweight graphql cdn built for [Cloudflare Workers](https://workers.cloudflare.com). It sits in front of your web server, catches HTTP requests and tries to serve cached responses.

- ⚡ Serverless: Massive Scaling trough the network of cloudflare.
- ⚙️ Configurable: Great Flexibility trough the config.yaml.

## 📦 Get started

[Install `wrangler` CLI](https://github.com/cloudflare/wrangler#installation) and authorize `wrangler` with a Cloudflare account.

```console
npm install -g @cloudflare/wrangler
wrangler login
```

Edit the config.yaml file and upload the worker:

```console
wrangler publish
```

## Roadmap

- [ ] Retries
- [ ] Purge API
