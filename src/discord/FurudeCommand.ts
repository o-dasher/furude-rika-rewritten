import {
  CommandInteraction,
  CacheType,
  PermissionResolvable,
} from 'discord.js';
import FurudeRika from '../client/FurudeRika';
import BaseCommand from '../framework/commands/BaseCommand';
import FurudeCommandWrapper from './FurudeCommandWrapper';

export default abstract class FurudeCommand extends BaseCommand<FurudeRika> {
  public override async onInsufficientPermissions(
    client: FurudeRika,
    interaction: CommandInteraction<CacheType>,
    missingPermissions?: PermissionResolvable
  ): Promise<void> {
    FurudeCommandWrapper.onInsufficientPermissions(
      this,
      client,
      interaction,
      missingPermissions
    );
  }
}
