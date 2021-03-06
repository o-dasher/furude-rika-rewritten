import type DefaultContext from '../../../../client/contexts/DefaultContext';
import CommandOptions from '../../../../containers/CommandOptions';
import Strings from '../../../../containers/Strings';
import DBReminder from '../../../../database/entity/DBReminder';
import FurudeSubCommand from '../../../../discord/commands/FurudeSubCommand';
import BaseEmbed from '../../../../modules/framework/embeds/BaseEmbed';
import MessageCreator from '../../../../modules/framework/helpers/MessageCreator';
import UserOption from '../../../../modules/framework/options/classes/UserOption';
import InteractionUtils from '../../../../modules/framework/interactions/InteractionUtils';
import { assertDefined } from '../../../../modules/framework/types/TypeAssertions';
import type { TypedArgs } from '../../../../modules/framework/commands/contexts/types';

type Args = {
  user: UserOption;
};
export default class ReminderCheck extends FurudeSubCommand<
  DefaultContext<TypedArgs<Args>>,
  Args
> {
  public static MAX_REMINDER_LENGTH = 16;

  public createArgs(): Args {
    return {
      user: new UserOption(true)
        .setName(CommandOptions.user)
        .setDescription('The user you want to check the reminders.'),
    };
  }

  public constructor() {
    super({
      name: 'check',
      description: 'Check all your pending reminders.',
    });
  }

  public async trigger(
    context: DefaultContext<TypedArgs<Args>>
  ): Promise<void> {
    const { interaction, client, args } = context;
    const { localizer } = client;
    const { user } = args;

    assertDefined(user);

    const reminders = DBReminder.getAllRemindersForUser(client, user);

    let allReminders = Strings.EMPTY;
    if (reminders.length > 0) {
      for (let i = 0; i < reminders.length; i++) {
        const reminder = reminders[i];

        assertDefined(reminder);

        allReminders += `${i + 1} - `;
        let displayContent = reminder.reminder
          .trim()
          .substring(0, ReminderCheck.MAX_REMINDER_LENGTH);
        if (displayContent.length >= ReminderCheck.MAX_REMINDER_LENGTH) {
          displayContent += '...';
        }
        allReminders += localizer.getTranslationFromContext(
          context,
          (k) => k.reminder.will_fire,
          {
            CONTENT: MessageCreator.block(displayContent),
            TIME: MessageCreator.timeStamp(reminder.remind_end_date),
          }
        );
        allReminders += '\n';
      }
    } else {
      allReminders = localizer.getTranslationFromContext(
        context,
        (k) => k.errors.nothing_here,
        {}
      );
    }

    allReminders = MessageCreator.bold(allReminders);

    const embed = new BaseEmbed(
      {
        title: MessageCreator.bold(
          localizer.getTranslationFromContext(
            context,
            (k) => k.reminder.string,
            {
              USER: user.username,
            }
          )
        ),
        description: allReminders,
      },
      interaction
    );

    await InteractionUtils.reply(interaction, {
      embeds: [embed],
    });
  }
}
