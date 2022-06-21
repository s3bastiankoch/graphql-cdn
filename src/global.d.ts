import type { UseResponseCacheParameter } from "@envelop/response-cache";
import type { CachingStrategy } from "./types";

declare global {
	const __schema__: string;
	const __upstreamUrl__: string;
	const __cachingStrategy__: CachingStrategy;
	const __cachingOptions__: UseResponseCacheParameter<any>;
	const __upstashRedisRestUrl__: string | undefined;
	const __upstashRedisRestToken__: string | undefined;
}

export {};
