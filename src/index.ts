import { Elysia } from "elysia";
import { t } from "@caffeine/models";
import { Schema } from "@caffeine/schema";
import { InvalidEnvironmentException } from "@caffeine/errors/infra";

export function CaffeineEnv<ContentType extends t.TObject[]>(
	...args: ContentType
) {
	type ContentKeys<T> = T extends t.TObject<infer P> ? keyof P : never;
	const envDTO = t.Composite<ContentType>(args);
	const envContent: Record<
		ContentKeys<ContentType[number]>,
		string
	> = Object.fromEntries(
		Object.entries(envDTO.properties).map(([key, _]) => [
			key,
			process.env[key],
		]),
	) as never;

	if (!Schema.make(envDTO).match(envContent)) {
		throw new InvalidEnvironmentException("system@boot");
	}

	return new Elysia().as("global").decorate("env", envContent);
}
