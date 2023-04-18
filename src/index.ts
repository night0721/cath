export {
  CODMClient,
  CODMClientOptions,
  PerkData,
  ScorestreakData,
} from "./CODMClient";
export {
  StarboardClient,
  StarboardClientOptions,
  StarboardGuild,
  StarboardGuildOptions,
  starMessageData,
} from "./StarboardClient";
export { CodeClient, CodeData } from "./CodeClient";
export { URLClient, URLData } from "./URLClient";
export {
  GiveawaysClient,
  GiveawaySchema,
  GiveawaysClientOptions,
  DefaultGiveawayMessages,
} from "./GiveawaysClient";
export { ImageClient } from "./ImageClient/index";
export { random8ball } from "./functions/8ball";
export { getreddit, RedditObject } from "./functions/reddit";
export { Pagination } from "./functions/pagination";
export { bool } from "./functions/bool";
export { randint } from "./functions/randint";
export { timer } from "./functions/timer";
export { selectRandom } from "./functions/selectRandom";
export { parseMS, parseString } from "./functions/ms";
export { confirmation } from "./functions/confirmation";
export { HHMMSS } from "./functions/HHMMSS";
export { formatUpper } from "./functions/formatUpper";
export {
  DiscordActivity,
  DiscordActivityOptions,
  Applications,
} from "./functions/discord-activity";
export { cleanText } from "./functions/cleanText";
export { daysAgo } from "./functions/daysAgo";
export { sleep } from "./functions/sleep";
export { trimArray } from "./functions/trimArray";
export { superscript } from "./functions/superscript";
export { doublestruck } from "./functions/doublestruck";
export { fractur } from "./functions/fractur";
export { randomID } from "./functions/randomID";
export { round } from "./functions/round";

const config: ConfigURLS = {
  api: "https://api.night0721.me",
  code: "https://code.night0721.me",
  url: "https://url.night0721.me",
};
export default config;

interface ConfigURLS {
  api: string;
  code: string;
  url: string;
}
