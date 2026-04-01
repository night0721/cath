import { CathError } from "../Error/CathError";
import { config } from "../";
/**
 * Sends a 8ball response
 */
export async function fractur(word: string): Promise<string> {
  if (!word) {
    throw new CathError("Missing 'word'");
  }
  const response = await fetch(`${config.api}/api/v1/fun/fractur?text=${word}`);
  const data = await response.json() as { text: string };
  return data.text;
}
