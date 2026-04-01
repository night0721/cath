import { CathError } from "../Error/CathError";
import { config } from "../";
/**
 * Dobulestruck words
 */
export async function doublestruck(word: string): Promise<string> {
  if (!word) {
    throw new CathError("Missing 'word'");
  }
  const response = await fetch(`${config.api}/api/v1/fun/doublestruck?text=${word}`);
  const data = await response.json() as { text: string };
  return data.text;
}
