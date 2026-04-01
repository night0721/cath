import { CathError } from "../Error/CathError";
/**
 * Start a Discord Activity session
 * @example 
 * const Cath = require("cath")
 * const client = new Client()
 * const d = await Cath.DiscordActivity({
      application: "youtube",
      channel_id: "901542111005012099",
      token: client.token,
    });
    message.channel.send({ content: d });
 */
export async function DiscordActivity(options: DiscordActivityOptions) {
  const all = {
    youtube: "880218394199220334",
    youtubedev: "880218832743055411",
    poker: "755827207812677713",
    betrayal: "773336526917861400",
    fishing: "814288819477020702",
    chess: "832012774040141894",
    chessdev: "832012586023256104",
    lettertile: "879863686565621790",
    wordsnack: "879863976006127627",
    doodlecrew: "878067389634314250",
    awkword: "879863881349087252",
    spellcast: "852509694341283871",
  };
  if (!all[options.application]) {
    throw new CathError(
      "Application ID is not valid, if you want to see the list of applications, check the docs at https://cath.js.org/interfaces/Applications.html"
    );
  }
  if (!options.token) {
    throw new CathError("Missing 'token'");
  }
  if (!options.channel_id) {
    throw new CathError("Missing 'Channel ID'");
  }
  const response = await fetch(
    `https://discord.com/api/v9/channels/${options.channel_id}/invites`,
    {
      method: "POST",
      headers: {
        Authorization: `Bot ${options.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        max_age: 86400,
        max_uses: 0,
        target_application_id: all[options.application],
        target_type: 2,
        temporary: false,
        validate: null,
      }),
    }
  );
  const data = await response.json() as { code: string };
  return `https://discord.com/invite/${data.code}`;
}
export interface DiscordActivityOptions {
  application: string;
  token: string;
  channel_id: string;
}
export interface Applications {
  youtube: "880218394199220334";
  youtubedev: "880218832743055411";
  poker: "755827207812677713";
  betrayal: "773336526917861400";
  fishing: "814288819477020702";
  chess: "832012774040141894";
  chessdev: "832012586023256104";
  lettertile: "879863686565621790";
  wordsnack: "879863976006127627";
  doodlecrew: "878067389634314250";
  awkword: "879863881349087252";
  spellcast: "852509694341283871";
}
