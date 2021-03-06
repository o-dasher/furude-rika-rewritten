import OsuUserEventsBindable from '../bindables/OsuUserEventsBindable';
import type IBanchoAPIUserResponse from '../servers/implementations/bancho/interfaces/users/IBanchoAPIUserResponse';
import type TBanchoApiRawResponse from '../servers/implementations/bancho/interfaces/TBanchoApiRawResponse';
import type IOsuUserCounts from './interfaces/IOsuUserCounts';
import type IOsuUserEvent from './interfaces/IOsuUserEvent';
import type IOsuUserPPS from './interfaces/IOsuUserPPS';
import type IOsuUserRanks from './interfaces/IOsuUserRanks';
import type IOsuUserScores from './interfaces/IOsuUserScores';
import type IOsuUser from './IOsuUser';
import type IOsuScore from '../scores/IOsuScore';
import type { AnyServer } from '../servers/OsuServers';
import { assertDefined } from '../../framework/types/TypeAssertions';

export default abstract class BaseOsuUser<P> implements IOsuUser<P> {
  public readonly user_id: number;
  public readonly username: string;
  public readonly join_date: Date;
  public readonly counts: IOsuUserCounts;
  public readonly scores: IOsuUserScores;
  public readonly pps: IOsuUserPPS;
  public readonly level: number;
  public readonly accuracy: number;
  public readonly ranks: IOsuUserRanks;
  public readonly total_seconds_played: number;
  public readonly country: string;
  public readonly events: IOsuUserEvent[];
  public readonly server: AnyServer;

  /**
   *
   * @param res An api response, the constructor will convert that response into itself.
   */
  public constructor(
    raw_res: TBanchoApiRawResponse<IBanchoAPIUserResponse>,
    server: AnyServer
  ) {
    const res = raw_res[0];

    assertDefined(res);

    this.server = server;
    this.user_id = parseInt(res.user_id);
    this.username = res.username;
    this.join_date = new Date(res.join_date);
    this.counts = {
      300: parseInt(res.count300),
      100: parseInt(res.count100),
      50: parseInt(res.count50),
      plays: parseInt(res.playcount),
    };
    this.scores = {
      total: parseInt(res.total_score),
      ranked: parseInt(res.ranked_score),
    };
    this.pps = {
      raw: parseInt(res.pp_raw),
      global_rank: parseInt(res.pp_rank),
      country_rank: parseInt(res.pp_country_rank),
    };
    this.level = parseFloat(res.level);
    this.accuracy = parseFloat(res.accuracy);
    this.ranks = {
      ss: parseInt(res.count_rank_ss),
      ssh: parseInt(res.count_rank_ssh),
      s: parseInt(res.count_rank_s),
      sh: parseInt(res.count_rank_sh),
      a: parseInt(res.count_rank_a),
    };
    this.total_seconds_played = parseInt(res.total_seconds_played);
    this.country = res.country;
    this.events = [];
    for (const event of res.events) {
      this.events.push({
        display_html: event.display_html,
        beatmap_id: parseInt(event.beatmap_id),
        beatmap_set_id: parseInt(event.beatmap_set_id),
        date: new Date(event.date),
        epic_factor: new OsuUserEventsBindable(parseInt(event.epic_factor)),
      });
    }
  }

  public abstract fetchScores(
    params: P,
    fetchBeatmaps?: boolean
  ): Promise<IOsuScore[]>;

  public abstract getAvatarUrl(): string;

  public abstract getProfileUrl(): string;
}
