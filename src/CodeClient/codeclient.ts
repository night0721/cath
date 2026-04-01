import { config } from "../";
import { CodeData } from "./codeclient.interface";
import { CathError } from "../Error/CathError";
/**
 * @name CodeClient
 * @kind constructor
 */
export class CodeClient {
  constructor() { }
  /**
   * Sends the link of the code
   * @return {Promise<CodeData>}
   * @param {String} content
   * @param {String} title
   * @param {String} syntax
   */
  public async createBin(content: string, title: string, syntax: string): Promise<CodeData> {
    if (!content) throw new CathError("Missing 'content' property");
    if (!title) throw new CathError("Missing 'title' property");
    if (!syntax) throw new CathError("Missing 'syntax' property");
    const response = await fetch(config.bin, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, title, syntax }),
    });
    const data = await response.json() as CodeData;
    if (data?.url) {
      return data;
    } else {
      throw new CathError(`Code already exist`);
    }
  }
}
