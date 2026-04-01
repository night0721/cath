import { CathError } from "../Error/CathError";
import { config } from "../";
import { PerkData, ScorestreakData } from "./codmclient.interface";
/**
 * @name APIClient
 * @kind constructor
 * @param {String} key Authorization Key for API (Only for CODM commands)
 */
export class CODMClient {
  constructor(public key: string) {
    if (!key) throw new CathError("Missing 'key' property");
    if (key && typeof key !== "string")
      throw new CathError("API key must be a string");
  }
  /**
   * Sends a CODM perk object
   * @return {Promise<PerkData>}
   * @param {String} name
   */
  public async getperk(name: string): Promise<PerkData> {
    const response = await fetch(`${config.api}/api/v1/codm/perk?name=${name}`, {
      headers: {
        Authorization: this.key,
      },
    });
    const data = await response.json() as PerkData;
    if (!response.ok) throw new CathError(`Unauthorized to use`);
    return data;
  }

  public async getscorestreak(name: string): Promise<ScorestreakData> {
    const response = await fetch(`${config.api}/api/v1/codm/scorestreak?name=${name}`, {
      headers: {
        Authorization: this.key,
      },
    });
    const data = await response.json() as ScorestreakData;
    if (!response.ok) throw new CathError(`Unauthorized to use`);
    return data;
  }
}
