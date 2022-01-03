import { addDays, formatDuration, intervalToDuration } from 'date-fns';
import { CommandInteraction } from 'discord.js';
import { Column, Entity } from 'typeorm';
import CurrencyContainer from '../../containers/CurrencyContainer';
import MessageFactory from '../../helpers/MessageFactory';
import FurudeLocales from '../../localization/FurudeLocales';
import FurudeTranslationKeys from '../../localization/FurudeTranslationKeys';
import FurudeOperations from '../FurudeOperations';
import IDatabaseOperation from '../interfaces/IDatabaseOperation';
import GuildHyperDate from '../objects/hypervalues/concrets/guilds/GuildHyperDate';
import GuildHyperNumber from '../objects/hypervalues/concrets/guilds/GuildHyperNumber';
import { HyperTypes } from '../objects/hypervalues/HyperTypes';
import SnowFlakeIDEntity from './abstracts/SnowFlakeIDEntity';

interface IStreakOperation extends IDatabaseOperation {
  readonly lostStreak: boolean;
  readonly gotMaxStreak: boolean;
}

/**
 * This class contains information related to a Furude citizen,
 * they could possibly have things such as "Furude coins",
 * have some online exclusive "assets" and others.
 */
@Entity()
export default class DBCitizen extends SnowFlakeIDEntity {
  public static readonly STARTING_CAPITAL = 100;
  public static readonly WEEKLY_STREAK = 7;
  public static readonly AMOUNT_DAILY = 50;

  @Column((_type) => GuildHyperNumber)
  capital = new GuildHyperNumber();

  @Column((_type) => GuildHyperNumber)
  streak = new GuildHyperNumber();

  @Column((_type) => GuildHyperDate)
  lastTimeClaimedDaily = new GuildHyperDate(null);

  private incrementCapital(
    interaction: CommandInteraction,
    type: HyperTypes,
    amount: number
  ): IDatabaseOperation {
    let capital = this.capital.getValueSwitchedForType(interaction, type)!;

    const resultingCapital = capital + amount;

    if (resultingCapital < 0) {
      return FurudeOperations.error(
        `${this.id} couldn't complete increment capital operation, because he doesn't have enough ${CurrencyContainer.CURRENCY_NAME}`
      );
    }

    capital = Math.max(0, resultingCapital);

    this.capital.setValueSwitchedForType(interaction, type, capital);

    return FurudeOperations.success(`Incremented ${this.id} capital.`);
  }

  /**
   *
   * @param amount Amount of days to be incremented (usually will always be 1)
   * @returns wether we reached the max streak.
   */
  private incrementStreak(
    interaction: CommandInteraction,
    type: HyperTypes,
    duration: Duration,
    selectedLastTimeClaimedDaily: Date | null | undefined,
    amount = 1
  ): IStreakOperation {
    const INCREMENT_SUCCESS = ', incremented streak successfully.';

    const DEFAULT_UNFORTUNATELY = ' but unfortunately ';
    let unfortunately = DEFAULT_UNFORTUNATELY;

    let lostStreak = false;
    let gotMaxStreak = false;

    const makeSuccess = (prefix: string) => {
      let response = `${prefix}${INCREMENT_SUCCESS}$`;
      if (unfortunately != DEFAULT_UNFORTUNATELY) {
        response += unfortunately;
      }
      return {
        ...FurudeOperations.success(response),
        ...{ lostStreak, gotMaxStreak },
      };
    };

    let streak = this.streak.getValueSwitchedForType(interaction, type)!;

    if (selectedLastTimeClaimedDaily) {
      if (duration.days && duration.days > 1) {
        streak = 0;
        lostStreak = true;
        unfortunately += ' lost the streak...';
      }
    }

    streak += amount;
    this.streak.setValueSwitchedForType(interaction, type, streak);

    if (streak % DBCitizen.WEEKLY_STREAK == 0) {
      gotMaxStreak = true;
      return makeSuccess('Streak achieved');
    }

    return makeSuccess('Streak not achieved');
  }

  /**
   *
   * @param amount the amount of coins to be claimed
   * @returns wether you could claim or not because you had already claimed this day
   */
  public claimDaily(
    interaction: CommandInteraction,
    localizer: FurudeLocales,
    type: HyperTypes,
    amount = DBCitizen.AMOUNT_DAILY
  ): IDatabaseOperation {
    const dateNow = new Date();
    const selectedLastTimeClaimedDaily =
      this.lastTimeClaimedDaily.getValueSwitchedForType(interaction, type);
    const startDate = selectedLastTimeClaimedDaily ?? dateNow;

    const duration = intervalToDuration({
      start: startDate,
      end: dateNow,
    });

    if (selectedLastTimeClaimedDaily && duration.days == 0) {
      const ableToClaimWhen = intervalToDuration({
        start: dateNow,
        end: addDays(startDate, 1),
      });
      return FurudeOperations.error(
        localizer.get(FurudeTranslationKeys.DATABASE_CITIZEN_ALREADY_CLAIMED, [
          MessageFactory.block(formatDuration(ableToClaimWhen)),
        ])
      );
    } else {
      this.lastTimeClaimedDaily.setValueSwitchedForType(
        interaction,
        type,
        dateNow
      );
    }

    const streakOperation = this.incrementStreak(
      interaction,
      type,
      duration,
      selectedLastTimeClaimedDaily
    );

    if (streakOperation.gotMaxStreak) {
      amount *= 2;
    }

    this.incrementCapital(interaction, type, amount);

    return FurudeOperations.success(
      localizer.get(FurudeTranslationKeys.DATABASE_CITIZEN_CLAIM_SUCCESS, [
        MessageFactory.block(amount.toFixed()),
        MessageFactory.block(
          this.streak.getValueSwitchedForType(interaction, type)!.toString()
        ),
        MessageFactory.block(
          this.capital.getValueSwitchedForType(interaction, type)!.toFixed()
        ),
      ])
    );
  }

  /**
   * Assigns a new account (this instance) to our parent (A DBUser).
   * If the parent didn't had an open account beforehand.
   */
  public openAccount(localizer: FurudeLocales): IDatabaseOperation {
    if (!this.justCreated) {
      return FurudeOperations.error(
        localizer.get(FurudeTranslationKeys.ECONOMY_OPEN_FAIL)
      );
    }

    this.capital = new GuildHyperNumber();
    this.capital.global = DBCitizen.STARTING_CAPITAL;

    return FurudeOperations.success(
      localizer.get(FurudeTranslationKeys.ECONOMY_OPEN_SUCCESS)
    );
  }
}
