import { z } from "zod";

export const ConfigSchema = z.object({
	schema: z.union([
		z.object({
			url: z.string().url(),
		}),
		z.object({
			file: z.string(),
		}),
	]),
	upstream: z.string().url(),

	cache: z.object({
		strategy: z.union([
			z.literal("memory"),
			z.literal("upstash"),
			z.literal("cf"),
		]),
		ttl: z.number(),
		ttlPerType: z.record(z.string(), z.number()),
		ttlPerSchemaCoordinate: z.record(z.string(), z.number()),
		ignoredTypes: z.array(z.string()),
	}),
});
