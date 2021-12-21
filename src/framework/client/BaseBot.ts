import {
  Base,
  Client,
  ClientOptions,
  Collection,
  CommandInteraction,
  GuildMember,
} from 'discord.js';
import DirectoryMapper from '../io/DirectoryMapper';
import CommandResolver from '../io/object_resolvers/command_resolvers/CommandResolver';
import IBot from './IBot';
import BaseCommand from '../commands/BaseCommand';
import ICommandRunResponse from './ICommandRunResponse';
import consola from 'consola';
import IBotDevInformation from './IBotDevInformation';
import DirectoryMapperFactory from '../io/DirectoryMapperFactory';
import path from 'path';
import fsSync from 'fs';
import SubCommandResolver from '../io/object_resolvers/command_resolvers/SubCommandResolver';
import ICommand from '../commands/ICommand';
import SubCommand from '../commands/SubCommand';

export default abstract class BaseBot extends Client implements IBot {
  public readonly commands: Collection<string, BaseCommand<BaseBot>> =
    new Collection();
  public readonly subCommands: Collection<
    BaseCommand<BaseBot>,
    SubCommand<BaseBot>[]
  > = new Collection();
  public readonly commandMappers: DirectoryMapper[] = [];
  public readonly devInfo: IBotDevInformation;
  public readonly devOptions: IDevOptions;
  private readonly commandMapperFactory?: DirectoryMapperFactory;
  private readonly subCommandsDirectory: string;
  private onCommandsLoaded?: () => void;

  public constructor(
    options: ClientOptions,
    devOptions: IDevOptions,
    onCommandsLoaded?: () => void,
    commandMapperFactory?: DirectoryMapperFactory,
    subCommandsDirectory: string = 'subcommands',
    ...commandMappers: DirectoryMapper[]
  ) {
    super(options);
    this.subCommandsDirectory = subCommandsDirectory;
    this.devOptions = devOptions;
    this.commandMappers = commandMappers;
    this.commandMapperFactory = commandMapperFactory;
    this.onCommandsLoaded = onCommandsLoaded;
    this.devInfo = {
      ownerIds: this.devOptions.OWNER_IDS,
      token: process.env[this.devOptions.ENV_TOKEN_VAR],
    };
  }

  private async loadCommands() {
    if (this.commandMapperFactory) {
      const newMappers = await this.commandMapperFactory.buildMappers();
      this.commandMappers.push(...newMappers);
    }
    const commandResolver = new CommandResolver(...this.commandMappers);
    const resolvedCommands = await commandResolver.getAllObjects();
    for await (const commandRes of resolvedCommands) {
      this.commands.set(commandRes.object.name, commandRes.object);
      const subCommandPath = path.join(
        commandRes.directory.path,
        this.subCommandsDirectory
      );
      if (fsSync.existsSync(subCommandPath)) {
        const subCommandsMapper = new DirectoryMapper(subCommandPath);
        const subCommandResolver = new SubCommandResolver(subCommandsMapper);
        const resolvedSubCommands = await subCommandResolver.getAllObjects();
        const subCommands = [];

        for await (const subCommandRes of resolvedSubCommands) {
          commandRes.object.addSubcommand(subCommandRes.object);
          subCommands.push(subCommandRes.object);
        }

        this.subCommands.set(commandRes.object, subCommands);
      }
    }
    if (this.onCommandsLoaded) this.onCommandsLoaded();
  }

  async start() {
    await this.login(this.devInfo.token);

    const developmentGuildID =
      process.env[this.devOptions.ENV_DEVELOPMENT_SERVER];

    this.on('ready', async (_client: Client) => {
      if (developmentGuildID) {
        this.devInfo.developmentGuild = await this.guilds.fetch(
          developmentGuildID
        );
        consola.success(`Development Guild: ${this.devInfo.developmentGuild}`);
      }
      await this.loadCommands();
    });

    this.on('interactionCreate', async (interaction) => {
      if (!interaction.isCommand) return;

      if (!(interaction instanceof CommandInteraction)) return;

      const command = this.commands.get(interaction.commandName);

      if (!command) return;

      if (!(await this.verifyPermissionsToRunCommand(interaction, command))) {
        return;
      }

      const subCommandOption = interaction.options.getSubcommand(
        !!command.information.requiresSubCommand
      );
      if (subCommandOption) {
        const runnableSubCommand = this.subCommands
          .get(command)
          ?.find((sub) => sub.name == subCommandOption);
        if (runnableSubCommand) {
          await runnableSubCommand.run(this, interaction);
        } else {
          await this.onSubCommandNotFound(interaction);
        }
        return;
      } else {
        await command.run(this, interaction);
      }

      this.onCommandRun({
        interaction,
        command: command,
      });
    });
  }

  /**
   *
   * @param interaction The context interaction to verify the permissions
   * @param command the command used on this interaction
   * @returns wether the user has enough permissions to execute said command
   */
  private async verifyPermissionsToRunCommand(
    interaction: CommandInteraction,
    command: ICommand<any, any>
  ): Promise<boolean> {
    if (command.information.ownerOnly) {
      if (!this.devInfo.ownerIds.includes(interaction.user.id)) {
        await command.onInsufficientPermissions(this, interaction);
        return false;
      }
    }
    if (command.information.permissions) {
      if (interaction.guild) {
        if (
          !(interaction.member as GuildMember).permissions.has(
            command.information.permissions
          )
        ) {
          await command.onInsufficientPermissions(
            this,
            interaction,
            command.information.permissions
          );
          return false;
        }
      } else {
        return false;
      }
    }
    return true;
  }

  public async onSubCommandNotFound(
    interaction: CommandInteraction
  ): Promise<void> {
    consola.log(
      `Couldn't find subcommand: ${interaction.options.getSubcommand()}`
    );
  }

  public onCommandRun(response: ICommandRunResponse) {
    consola.log(`${response.command} command was ran!`);
  }
}
