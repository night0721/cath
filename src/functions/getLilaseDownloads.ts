/**
 * @name getLilaseDownloads
 * @description Get the number of downloads
 */
export async function getLilaseDownloads(): Promise<number> {
  const response = await fetch(
    "https://api.github.com/repos/night0721/Lilase/releases"
  );
  const data = await response.json() as { assets: { download_count: number }[] }[];
  let sum = 0;
  data.forEach(release => {
    sum += release.assets[0].download_count;
  });
  return sum;
}
