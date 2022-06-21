import { config } from "dotenv";
config();
import { build } from "esbuild";
import { loadSchema } from "@graphql-tools/load";
import { UrlLoader } from "@graphql-tools/url-loader";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { replace } from "esbuild-plugin-replace";
import { GraphQLSchema, printSchema } from "graphql";
import fs from "fs/promises";
import YAML from "yaml";
import { ConfigSchema } from "./config";

const CONFIG_FILE = "config.yaml";

const main = async () => {
	const config = ConfigSchema.safeParse(
		YAML.parse(await fs.readFile(CONFIG_FILE, "utf-8"))
	);

	if (!config.success) {
		console.error(config.error.message);
		return;
	}

	const {
		upstream,
		schema: configSchema,
		cache: { strategy, ...cachingOptions },
	} = config.data;

	let schema: GraphQLSchema;

	// Check for env variables in case of upstash
	if (strategy === "upstash") {
		if (!process.env.UPSTASH_REDIS_REST_URL) {
			console.error("UPSTASH_REDIS_REST_URL not set");
			return;
		}
		if (!process.env.UPSTASH_REDIS_REST_TOKEN) {
			console.error("UPSTASH_REDIS_REST_TOKEN not set");
			return;
		}
	}

	// TODO: Error handling
	if ("url" in configSchema) {
		schema = await loadSchema(configSchema.url, {
			loaders: [new UrlLoader()],
		});
	} else {
		schema = await loadSchema(configSchema.file, {
			loaders: [new GraphQLFileLoader()],
		});
	}

	build({
		bundle: true,
		target: "esnext",
		format: "esm",
		entryPoints: ["./src/index.ts"],
		outfile: "./dist/worker.mjs",
		sourcemap: true,
		charset: "utf8",
		outExtension: { ".js": ".mjs" },
		minify: process.env.NODE_ENV === "production" ? true : false,
		plugins: [
			replace({
				__schema__: "`" + printSchema(schema) + "`",
				__upstreamUrl__: "'" + upstream + "'",
				__cachingStrategy__: "'" + strategy + "'",
				__cachingOptions__: JSON.stringify(cachingOptions),
				__upstashRedisRestUrl__: "'" + process.env.UPSTASH_REDIS_REST_URL + "'",
				__upstashRedisRestToken__:
					"'" + process.env.UPSTASH_REDIS_REST_TOKEN + "'",
			}),
		],
	}).catch((err) => {
		console.error(err.stack);
		process.exitCode = 1;
	});
};

main();
