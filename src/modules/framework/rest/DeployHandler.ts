import type {
  ApplicationCommandDataResolvable,
  CacheType,
  CommandInteraction,
  Guild,
} from 'discord.js';
import consola from 'consola';
import type BaseBot from '../client/BaseBot';
import type { RequestData } from '@discordjs/rest';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { assertDefined } from '../types/TypeAssertions';
import type IWithTaskCompletionListener from '../interfaces/IWithTaskCompletionListener';
import type ICommandContext from '../commands/contexts/ICommandContext';
import type { TypedArgs } from '../commands/contexts/types';

type resFunctions = Partial<IWithTaskCompletionListener> & {
  onCommandNotFound?: () => void;
  onInvalidCommand?: () => void;
};

const rest = new REST({ version: '9' });
let putToken = false;

export default class DeployHandler {
  public static async deployCommand<
    CTX extends ICommandContext<TypedArgs<unknown>>
  >(options: {
    client: BaseBot<CTX>;
    commandName: string;
    isDebug: boolean;
    interaction?: CommandInteraction<CacheType>;
    guild?: Guild;
    resFunctions: resFunctions;
  }): Promise<void> {
    const { client, commandName, isDebug, interaction, resFunctions } = options;
    const { onCommandNotFound, onInvalidCommand, onError, onSuccess } =
      resFunctions;

    const command = client.commands.get(commandName);

    if (!command) {
      if (onCommandNotFound) onCommandNotFound();
      return;
    }

    if (!command.name || !command.description) {
      if (onInvalidCommand) onInvalidCommand();
      return;
    }

    let commandReceiver = null;
    if (isDebug) {
      commandReceiver = options.guild?.commands ?? interaction?.guild?.commands;
      if (!commandReceiver) {
        if (onError) onError();
        return;
      }
    } else {
      commandReceiver = client.application?.commands;
    }

    await commandReceiver?.create(
      command.toJSON() as ApplicationCommandDataResolvable
    );

    if (onSuccess) onSuccess();
  }

  public static async deployAll<
    CTX extends ICommandContext<TypedArgs<unknown>>
  >(
    client: BaseBot<CTX>,
    isDebug: boolean,
    resFunctions?: IWithTaskCompletionListener
  ): Promise<void> {
    if (!putToken) {
      putToken = true;
      assertDefined(client.devInfo.token);
      rest.setToken(client.devInfo.token);
    }

    const commands = [...client.commands.values()].map((command) =>
      command.toJSON()
    );

    const req: RequestData = { body: commands };

    assertDefined(client.user);
    assertDefined(client.devInfo.developmentGuild);

    try {
      await rest.put(
        isDebug
          ? Routes.applicationGuildCommands(
              client.user.id,
              client.devInfo.developmentGuild.id
            )
          : Routes.applicationCommands(client.user.id),
        req
      );
      if (resFunctions?.onSuccess) resFunctions.onSuccess();
    } catch (e) {
      consola.error(e);
      if (resFunctions?.onError) resFunctions.onError();
    }
  }
}
