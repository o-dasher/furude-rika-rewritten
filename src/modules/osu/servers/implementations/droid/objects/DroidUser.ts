import IBanchoAPIUserResponse from '../../bancho/interfaces/users/IBanchoAPIUserResponse';
import TBanchoApiRawResponse from '../../bancho/interfaces/TBanchoApiRawResponse';
import OsuServers from '../../../OsuServers';
import IOsuScore from '../../../../scores/IOsuScore';
import IDroidOsuUserRecentsParams from '../params/IDroidOsuUserRecentsParams';
import BaseOsuUser from '../../../../users/BaseOsuUser';

interface IDroidUserExtension {
  html?: string;
}

export default class DroidUser
  extends BaseOsuUser<IDroidOsuUserRecentsParams>
  implements IDroidUserExtension
{
  html?: string;

  public constructor(
    raw_res: TBanchoApiRawResponse<IBanchoAPIUserResponse>,
    droid: IDroidUserExtension = {}
  ) {
    super(raw_res, OsuServers.droid);
    this.html = droid.html;
  }
  override async fetchScores(
    params: IDroidOsuUserRecentsParams,
    fetchBeatmaps?: boolean
  ): Promise<IOsuScore[]> {
    return await this.server.userRecents.get(params, fetchBeatmaps);
  }
}
