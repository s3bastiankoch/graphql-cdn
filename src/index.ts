import { createServer, useSchema } from "@graphql-yoga/common";
import { wrapSchema } from "@graphql-tools/wrap";
import { AsyncExecutor } from "@graphql-tools/utils";
import { buildSchema, print } from "graphql";
import { useResponseCache } from "@envelop/response-cache";
import { Redis } from "@upstash/redis";
import {
	UpstashCacheAdapter,
	CfCacheAdapter,
	MemoryCacheAdapter,
} from "./cache";
import {
	schema,
	upstreamUrl,
	cachingOptions,
	cachingStrategy,
	upstashRedisRestToken,
	upstashRedisRestUrl,
} from "./injected";
import type { CachingStrategy } from "./types";

const selectCacheByStrategy = (strategy: CachingStrategy) => {
	switch (strategy) {
		case "upstash":
			return UpstashCacheAdapter(
				new Redis({
					url: upstashRedisRestUrl as string,
					token: upstashRedisRestToken as string,
				})
			);
		case "cf":
			return CfCacheAdapter(upstreamUrl);
		default:
			return MemoryCacheAdapter();
	}
};

const executor: AsyncExecutor = async ({ document, variables }) => {
	const query = print(document);

	// TODO: Retry
	try {
		const fetchResult = await fetch(upstreamUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ query, variables }),
		});

		return await fetchResult.json();
	} catch (e) {
		console.error("ERROR", e);
	}

	return {};
};

const yoga = createServer({
	plugins: [
		useSchema(
			wrapSchema({
				schema: buildSchema(schema),
				executor,
			})
		),
		useResponseCache({
			...cachingOptions,
			cache: selectCacheByStrategy(cachingStrategy),
		}),
	],
});

yoga.start();
