import type DefaultContext from '../../client/contexts/DefaultContext';
import CommandOptions from '../../containers/CommandOptions';
import FurudeCommand from '../../discord/commands/FurudeCommand';
import BaseEmbed from '../../modules/framework/embeds/BaseEmbed';
import UserOption from '../../modules/framework/options/classes/UserOption';
import InteractionUtils from '../../modules/framework/interactions/InteractionUtils';
import { assertDefined } from '../../modules/framework/types/TypeAssertions';
import type { TypedArgs } from '../../modules/framework/commands/contexts/types';

type Args = {
  user: UserOption;
};

export default class Avatar extends FurudeCommand<
  DefaultContext<TypedArgs<Args>>,
  Args
> {
  public createArgs(): Args {
    return {
      user: new UserOption(true)
        .setName(CommandOptions.user)
        .setDescription('The user you want the avatar from.'),
    };
  }

  public constructor() {
    super({
      name: 'avatar',
      description: "Displays your's or another user Avatar.",
    });
  }

  public async trigger(
    context: DefaultContext<TypedArgs<Args>>
  ): Promise<void> {
    const { interaction, args, client } = context;
    const { localizer } = client;
    const { user } = args;

    assertDefined(user);

    const avatar = user.avatarURL({ dynamic: true, size: 1024 });
    assertDefined(avatar);

    const embed = new BaseEmbed(
      {
        title: localizer.getTranslationFromContext(
          context,
          (k) => k.avatar.response,
          { USER: user.username }
        ),
        image: {
          url: avatar,
        },
      },
      interaction
    );

    await InteractionUtils.reply(interaction, {
      embeds: [embed],
    });
  }
}
