import type { Cache } from "@envelop/response-cache";
import type { ExecutionResult } from "@graphql-tools/utils";
import { Redis } from "@upstash/redis";

export const UpstashCacheAdapter = (redis: Redis): Cache => ({
	async get(id) {
		const res = await redis.get(id);

		return res as ExecutionResult;
	},
	async set(id, data) {
		await redis.set(id, data);
	},
	async invalidate(entities) {
		for (const entity of entities) {
			if (entity.id) {
				await redis.del(String(entity.id));
			}
		}
	},
});
