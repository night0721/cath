import { config } from "../";
import { URLData } from "./urlclient.interface";
import { CathError } from "../Error/CathError";
/**
 */
export class URLClient {
  constructor() { }
  /**
   * Sends the link of the URL
   * @return {Promise<URLData>}
   * @param {String} url
   * @param {String} password
   */
  public async createShortURL(
    url: string,
    password?: string
  ): Promise<URLData> {
    if (!url) throw new CathError("Missing 'url' property");
    const response = await fetch(`${config.bin}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        password,
      }),
    });
    const data = await response.json() as URLData;
    if (data?.id) {
      return data;
    }
  }
}
