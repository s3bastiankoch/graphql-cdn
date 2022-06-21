import type { Cache } from "@envelop/response-cache";
import type { ExecutionResult } from "@graphql-tools/utils";

const CACHE_NAME = "cf-cache";

export const CfCacheAdapter = (baseUrl: string): Cache => ({
	async get(id) {
		const cache = await caches.open(CACHE_NAME);

		const url = new URL(baseUrl);
		url.pathname = id;
		const response = await cache.match(url.toString());

		return (await response?.json()) as ExecutionResult;
	},
	async set(id, data) {
		const cache = await caches.open(CACHE_NAME);

		const url = new URL(baseUrl);
		url.pathname = id;

		cache.put(url.toString(), new Response(JSON.stringify(data)));
	},
	async invalidate(entities) {
		for (const entity of entities) {
			if (entity.id) {
				await caches.delete(String(entity.id));
			}
		}
	},
});
