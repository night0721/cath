import { config } from "../";
/**
 */
export class ImageClient {
  constructor() { }
  private endpoint(end: string, ava: string, ava1?: string, ava2?: string) {
    if (ava && ava1 && !ava2)
      return `${config.api}/api/v1/image/${end}?image=${ava}&image2=${ava1}`;
    else if (ava && ava1 && ava2)
      return `${config.api}/api/v1/image/${end}?image=${ava}&image2=${ava1}&image3=${ava2}`;
    else return `${config.api}/api/v1/image/${end}?image=${ava}`;
  }
  public busted(AvatarURL: string) {
    return this.endpoint("busted", AvatarURL);
  }
  public communism(AvatarURL: string) {
    return this.endpoint("communism", AvatarURL);
  }
  public gun(AvatarURL: string) {
    return this.endpoint("gun", AvatarURL);
  }
  public mask(AvatarURL: string) {
    return this.endpoint("mask", AvatarURL);
  }
  public whodidthis(AvatarURL: string) {
    return this.endpoint("whodidthis", AvatarURL);
  }
  public pray(AvatarURL: string) {
    return this.endpoint("pray", AvatarURL);
  }
  public pressplay(AvatarURL: string) {
    return this.endpoint("pressplay", AvatarURL);
  }
  public vr(AvatarURL: string) {
    return this.endpoint("vr", AvatarURL);
  }
  public rifleshoot(AvatarURL: string) {
    return this.endpoint("rifleshoot", AvatarURL);
  }
  public bestmeme(AvatarURL: string) {
    return this.endpoint("bestmeme", AvatarURL);
  }
  public robert(AvatarURL: string) {
    return this.endpoint("robert", AvatarURL);
  }
  public saveonlyone(
    AvatarURL1: string,
    AvatarURL2: string,
    AvatarURL3: string
  ) {
    return this.endpoint("saveonlyone", AvatarURL1, AvatarURL2, AvatarURL3);
  }
  public alone(AvatarURL: string) {
    return this.endpoint("alone", AvatarURL);
  }
  public toilet(AvatarURL: string) {
    return this.endpoint("toilet", AvatarURL);
  }
  public moment(AvatarURL: string) {
    return this.endpoint("moment", AvatarURL);
  }
  public awesome(AvatarURL: string) {
    return this.endpoint("awesome", AvatarURL);
  }
}
