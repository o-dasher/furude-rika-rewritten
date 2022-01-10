import { CommandInteraction, CacheType } from 'discord.js';
import CommandPrecondition from './abstracts/CommandPrecondition';
import ICommandValidatorPrecondition from './interfaces/ICommandValidatorPrecondition';

export default class RequiresSubCommandsPrecondition
  extends CommandPrecondition
  implements ICommandValidatorPrecondition
{
  protected validateInternally(
    interaction: CommandInteraction<CacheType>
  ): boolean {
    return !!interaction.options.getSubcommand(false);
  }
}
