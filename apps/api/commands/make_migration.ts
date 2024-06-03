import { BaseCommand, args } from '@adonisjs/core/ace';
import type { CommandOptions } from '@adonisjs/core/types/ace';

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default class MakeMigration extends BaseCommand {
	static readonly commandName = 'make:migration';
	static readonly description = 'Create a new Kysely migration file';
	static readonly options: CommandOptions = {};

	@args.string({ description: 'Name of the migration file' })
	declare name: string;

	async run() {
		const entity = this.app.generators.createEntity(this.name);
		const migrationName = this.app.generators.commandFileName(entity.name).slice(0, -'.ts'.length);
		const fileName = `${new Date().getTime()}_${migrationName}.ts`;

		const codemods = await this.createCodemods();
		await codemods.makeUsingStub(this.app.commandsPath('stubs'), 'make/migration.stub', {
			entity,
			migration: {
				tableName: migrationName,
				fileName,
			},
		});
	}
}
