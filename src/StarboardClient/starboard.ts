import {
  Client,
  MessageReaction,
  Collection,
  Snowflake,
  TextChannel,
  Message,
  EmbedBuilder,
  MessageCreateOptions,
  ColorResolvable,
  MessageEditOptions,
  Colors,
} from "discord.js";
import {
  starMessageData,
  StarboardClientOptions,
  StarboardGuild,
} from "./starboard.interface";

export class StarboardClient {
  public client: Client;
  public color: ColorResolvable;
  public guilds: StarboardGuild[];
  public cache: Collection<Snowflake, starMessageData[]> = new Collection();

  constructor(options: StarboardClientOptions) {
    this.client = options.client;
    this.color = options.color || "Random";
    this.guilds = options.Guilds || [];
    this.client.on("ready", () => this.cacheData());
  }
  public config = {
    guilds: {
      set: (StarboardGuilds: StarboardGuild[]) => {
        this.guilds = StarboardGuilds;
        this.cacheData();
      },
      add: (StarboardGuild: StarboardGuild) => {
        const filtered = (this.guilds || []).filter(
          x => x.id === StarboardGuild.id
        );

        this.guilds = [...filtered, StarboardGuild];
        this.cacheData();
      },
    },
  };
  private cacheData() {
    this.guilds.forEach(async guild => {
      const channel = this.client.channels.cache.get(
        guild.options.starboardChannel
      ) as TextChannel;
      if (!channel) return;
      const messages = await channel.messages.fetch({ limit: 100 });
      if (!messages) return;
      const value = messages.reduce(
        (accumulator: starMessageData[], message) => {
          if (message.author.id !== this.client.user.id) return accumulator;
          const starCount = message.content.match(/(?<=\*\*)\d*(?=\*\*)/)?.[0];
          const origin = message.embeds?.[0]?.footer?.text.match(/\d*/)?.[0];
          if (!starCount || !origin) return accumulator;
          const data: starMessageData = {
            id: message.id,
            origin,
          };
          return [...accumulator, data];
        },
        []
      );
      this.cache.set(guild.id, value);
    });
  }
  private validGuild(guild: Snowflake): Boolean {
    return this.guilds.some(x => x.id === guild);
  }
  private getData(guildId: Snowflake): StarboardGuild {
    return this.guilds.find(x => x.id === guildId);
  }
  private generateEdit(starCount: number, message: Message): MessageCreateOptions {
    return {
      content: `⭐ **${starCount}** ${message.channel}`,
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: message.author.tag,
            iconURL: message.author.displayAvatarURL(),
          })
          .setColor(this.color)
          .setDescription(
            `Content: ${message.content ? message.content : "None"}`
          )
          .setThumbnail(message.author.displayAvatarURL())
          .addFields({ name: "Message", value: `[Jump!](${message.url})` })
          .setImage(message.attachments.first()?.url || null)
          .setTimestamp(message.createdTimestamp)
          .setFooter({ text: message.id }),
      ],
    };
  }

  public async listener(reaction: MessageReaction) {
    if (!this.validGuild) return;
    if (reaction.message.partial) await reaction.message.fetch();
    if (reaction.partial) await reaction.fetch();
    const { guildId, id } = reaction.message;
    if (reaction.emoji.name !== "⭐") return;
    const data = this.cache.get(guildId) || [];
    const starboardChannel = this.client.channels.cache.get(
      this.guilds.find(x => x.id === guildId)?.options.starboardChannel
    ) as TextChannel;
    const getMessage = data.find(x => x.origin === id);

    const generateEdit = this.generateEdit(
      reaction.count,
      reaction.message as Message
    );
    const sendMessage = () => {
      starboardChannel?.send(generateEdit).then(m => {
        this.cache.set(reaction.message.guildId, [
          ...data,
          { id: m.id, origin: reaction.message.id },
        ]);
      });
    };
    if (getMessage) {
      if (reaction.count === 0) {
        setTimeout(
          () =>
            starboardChannel.messages
              .fetch(getMessage.id)
              .then(async r => await r.delete()),
          10000
        );
      } else {
        starboardChannel.messages
          .fetch(getMessage.id)
          .then(publishedMessage => {
            publishedMessage.edit(generateEdit as MessageEditOptions);
          })
          .catch(sendMessage);
      }
    } else sendMessage();
  }
}
