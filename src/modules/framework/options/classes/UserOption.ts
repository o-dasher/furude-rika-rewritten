import { SlashCommandUserOption } from '@discordjs/builders';
import { CommandInteraction, User } from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import IDiscordOption from '../interfaces/IDiscordOption';

export default class UserOption
  extends SlashCommandUserOption
  implements IDiscordOption<User>
{
  private readonly defaultToSelf: boolean;
  public constructor(defaultToSelf = false) {
    super();
    this.defaultToSelf = defaultToSelf;
  }
  apiType: ApplicationCommandOptionTypes = ApplicationCommandOptionTypes.USER;
  apply(interaction: CommandInteraction) {
    const user = interaction.options.getUser(this.name, this.required);
    return user ? user : this.defaultToSelf ? interaction.user : null;
  }
}