import { relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BaseCommand } from '@adonisjs/core/ace';
import type { CommandOptions } from '@adonisjs/core/types/ace';
import { $ } from 'execa';
import { postgresUrl } from '#config/db';

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default class DbIntrospect extends BaseCommand {
	private static readonly outputPath = new URL('../types/db.ts', import.meta.url);

	static readonly commandName = 'db:introspect';
	static readonly description = 'Generate database schema by introspecting the actual database';

	static readonly options: CommandOptions = {};

	async run() {
		const output = fileURLToPath(DbIntrospect.outputPath);

		this.logger.info('Introspecting database with kysely-codegen:');
		for await (const line of $`yarn kysely-codegen --dialect=postgres --out-file=${output} --url=${postgresUrl.release()}`) {
			this.logger.log(line);
		}
		this.logger.success(`Database schema generated to ./${relative(process.cwd(), output)}`);
	}
}
