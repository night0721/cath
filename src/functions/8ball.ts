import { config } from "../";
/**
 * Sends a 8ball response
 */
export async function random8ball(): Promise<string> {
  const response = await fetch(`${config.api}/api/v1/fun/8ball`);
  const data = await response.json() as { answer: string };
  return data.answer;
}
