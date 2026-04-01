import { CathError } from "../Error/CathError";
import { config } from "../";
/**
 * Sends a superscript-ed word
 */
export async function superscript(word: string): Promise<string> {
  if (!word) {
    throw new CathError("Missing 'word'");
  }
  const response = await fetch(`${config.api}/api/v1/fun/superscript?text=${word}`);
  const data = await response.json() as { text: string };
  return data.text;
}
