import type IAPIOsuBeatmap from '../../../beatmaps/IAPIOsuBeatmap';

import OsuServers from '../../../OsuServers';
import type IBaseBanchoAPIScore from '../../bancho/interfaces/scores/IBaseBanchoAPIScore';
import BanchoScore from '../../bancho/objects/BanchoScore';

interface IDroidScoreExtension {
  beatmapHash?: string;
}
export default class DroidScore
  extends BanchoScore
  implements IDroidScoreExtension
{
  public beatmapHash?: string;

  public constructor(
    base: IBaseBanchoAPIScore,
    extension?: IDroidScoreExtension
  ) {
    super(base, OsuServers.droid);
    if (extension) {
      if (extension.beatmapHash) {
        this.beatmapHash = extension.beatmapHash;
      }
    }
  }

  public override async fetchBeatmap(): Promise<IAPIOsuBeatmap | undefined> {
    let newBeatmap: IAPIOsuBeatmap | undefined;
    if (this.beatmapHash) {
      newBeatmap = (
        await OsuServers.bancho.beatmaps.get({
          h: this.beatmapHash,
        })
      )[0];
    }
    if (newBeatmap) {
      this.apiBeatmap = newBeatmap;
    }
    return this.apiBeatmap;
  }
}
