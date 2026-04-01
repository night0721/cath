import mongoose, { Schema, model } from "mongoose";
import {
  Client,
  Snowflake,
  Message,
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  TextChannel,
  GuildMember,
  ButtonInteraction,
  ButtonStyle,
  MessageActionRowComponentBuilder,
} from "discord.js";
import { CathError } from "../Error/CathError";
import {
  GiveawaySchema,
  GiveawaysClientOptions,
  DefaultGiveawayMessages,
  InviteSchema,
} from "./giveaway.interface";
import { parseString } from "../functions/ms";
export class GiveawaysClient {
  public inviteschema = model<InviteSchema>(
    "cath-invite",
    new Schema({
      User: { type: String, required: true },
      Invites: { type: Schema.Types.Mixed, required: true },
    })
  );
  public schema = model<GiveawaySchema>(
    "cath-giveaways",
    new Schema({
      Guild: {
        type: String,
        required: true,
      },
      Channel: {
        type: String,
        required: true,
      },
      Message: {
        type: String,
        required: true,
      },
      HostBy: {
        type: String,
        required: true,
      },
      End: {
        type: Number,
        required: true,
      },
      Start: {
        type: Number,
        required: true,
      },
      Award: {
        type: String,
        required: true,
      },
      Winners: {
        type: Number,
        required: true,
      },
      Ended: {
        type: Boolean,
        default: false,
      },
      Invites: {
        type: Number,
        required: true,
        default: 0,
      },
      Requirements: {
        type: Schema.Types.Mixed,
        default: { Enabled: Boolean, Roles: [] },
      },
      Clickers: {
        type: [String],
        default: [],
      },
    })
  );
  public client: Client;
  public GiveawayMessages: DefaultGiveawayMessages;
  public MongooseConnectionURI: string;
  /**
   * @param {GiveawaysClientOptions} options
   */

  constructor(options: GiveawaysClientOptions) {
    this.GiveawayMessages = options.GiveawayMessages || this.GiveawayMessages;
    this.client = options.client;
    this.MongooseConnectionURI = options.MongooseConnectionURI;
    mongoose
      .connect(this.MongooseConnectionURI)
      .then(() => console.log("Connected to Giveaway Database"))
      .catch(e => {
        throw new CathError(e);
      });
    this.client.on("interactionCreate", async interaction => {
      if (interaction.isButton()) {
        let win: any;
        let L = 0;
        let no = false;
        if (!interaction.guild) return;
        await (interaction.member as GuildMember).fetch();
        const id = interaction.customId;
        if (id.startsWith("g")) {
          const tag = id.split("_");
          if (tag[0] === "genter") {
            const data = await this.schema.findOne({
              Message: interaction.message.id,
            });
            if (data.Invites > 0) {
              const invitedata = await this.inviteschema.findOne({
                User: (interaction.member as GuildMember).id,
              });
              if (!invitedata) {
                await interaction.reply({
                  content: "You have no invites, you can't enter",
                  ephemeral: true,
                });
              } else {
                L = invitedata.Invites.map(o => o.Uses).reduce((acc, cur) => {
                  return acc + cur;
                });
                if (data.Invites >= L) {
                  await interaction.reply({
                    content: "You have not enough invites, you can't enter",
                    ephemeral: true,
                  });
                  no = true;
                }
              }
            }
            if (data.Requirements.Enabled) {
              if (data.Requirements.Roles.length) {
                const roles = data.Requirements.Roles.map(x =>
                  (interaction.message as Message).guild.members.cache
                    .get(interaction.user.id)
                    .roles.cache.get(x)
                );
                if (!roles[0]) {
                  const requiredRoles = (
                    interaction.message as Message
                  ).guild.roles.cache
                    .filter(x => data.Requirements.Roles.includes(x.id))
                    .filter(
                      x =>
                        !(interaction.message as Message).guild.members.cache
                          .get(interaction.user.id)
                          .roles.cache.get(x.id)
                    )
                    .map(x => `\`${x.name}\``)
                    .join(", ");
                  try {
                    await interaction.reply({
                      content: this.GiveawayMessages.nonoRole.replace(
                        /{requiredRoles}/g,
                        requiredRoles
                      ),
                    });
                  } catch (e) {
                    await interaction.followUp({
                      content: this.GiveawayMessages.nonoRole.replace(
                        /{requiredRoles}/g,
                        requiredRoles
                      ),
                    });
                  }
                }
              }
            }
            if (!data.Clickers.includes(interaction.user.id) && !no) {
              data.Clickers.push(interaction.user.id);
              data.save();
              try {
                await interaction.reply({
                  content: this.GiveawayMessages.newParticipant.replace(
                    /{totalParticipants}/g,
                    data.Clickers.length.toString()
                  ),
                });
              } catch (e) {
                await interaction.followUp({
                  content: this.GiveawayMessages.newParticipant.replace(
                    /{totalParticipants}/g,
                    data.Clickers.length.toString()
                  ),
                });
              }
            } else if (data.Clickers.includes(interaction.user.id) && !no) {
              await interaction.followUp({
                content: this.GiveawayMessages.alreadyParticipated,
              });
            } else if (!data.Clickers.includes(interaction.user.id) && no) {
            } else if (data.Clickers.includes(interaction.user.id) && no) {
            }
          }
          if (tag[0] === "greroll") {
            if (interaction.user.id !== tag[1])
              await interaction.reply({
                content: "Only the host can reroll the giveaway",
              });
            try {
              win = await this.reroll(
                this.client,
                interaction.message.id,
                interaction.message as Message
              );
            } catch (err) {
              console.log(err);
              await interaction.reply({
                content: "⚠️ **Unable To Find That Giveaway**",
              });
            }
            if (!win.length)
              interaction.channel.send(this.GiveawayMessages.noParticipants);
            else {
              await interaction.reply({
                content: "Rerolled",
                ephemeral: true,
              });
              interaction.channel.send({
                content: this.GiveawayMessages.rerolledMessage.replace(
                  /{winner}/g,
                  `<@${win}>`
                ),
                components: [
                  new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents([
                    new ButtonBuilder()
                      .setLabel("Giveaway")
                      .setURL(
                        `https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}/${interaction.message.id}`
                      )
                      .setStyle(ButtonStyle.Link),
                  ]),
                ],
              });
            }
          }
          if (tag[0] === "gend") {
            if (interaction.user.id !== tag[1])
              await interaction.reply({
                content: "You Cannot End This Giveaway, Only The Host Can",
              });
            await interaction.reply({ content: "Ended", ephemeral: true });
            await this.endByButton(
              this.client,
              interaction.message.id,
              interaction
            );
          }
        }
      }
    });
  }

  private getButtons(host: string) {
    const reroll = new ButtonBuilder()
      .setLabel("Reroll")
      .setStyle(ButtonStyle.Secondary)
      .setCustomId(`greroll_${host}`)
      .setDisabled(true);

    const end = new ButtonBuilder()
      .setLabel("End")
      .setStyle(ButtonStyle.Danger)
      .setCustomId(`gend_${host}`);

    const enter = new ButtonBuilder()
      .setLabel("Enter")
      .setStyle(ButtonStyle.Success)
      .setCustomId(`genter_${host}`);

    const b = [enter, end, reroll];
    return b;
  }

  private async choose(winners: number, msgid: Snowflake, message: Message) {
    const data = await this.getByMessage(msgid);
    const final = [];
    if (data.Requirements.Enabled && data.Invites == 0) {
      const c = data.Clickers.filter(x =>
        this.checkRoles(x, data.Requirements.Roles, message)
      );
      for (let i = 0; i < winners; i++) {
        if (!c.length) return final[0] ? final : [];
        const win = c[Math.floor(Math.random() * c.length)];
        if (final.includes(win)) break;
        if (!win) return final[0] ? final : [];
        final.push(win);
      }
    } else {
      for (let i = 0; i < winners; i++) {
        if (!data.Clickers.length) return final[0] ? final : [];
        const win =
          data.Clickers[Math.floor(Math.random() * data.Clickers.length)];
        if (final.includes(win)) break;
        if (!win) return final[0] ? final : [];
        final.push(win);
      }
    }
    return final[0] ? final : [];
  }

  private checkRoles(
    userID: Snowflake,
    roleIDs: Snowflake[],
    message: Message
  ): Boolean {
    let res = null;
    roleIDs.forEach(roleID => {
      const role = message.guild.roles.cache.get(roleID);
      if (!message.guild.members.cache.get(userID).roles.cache.get(role.id))
        res = false;
    });
    if (res == false) return false;
    else return true;
  }

  private async editButtons(client: Client, data: GiveawaySchema) {
    const m = await (
      client.guilds.cache
        .get(data.Guild)
        .channels.cache.get(data.Channel) as TextChannel
    ).messages.fetch(data.Message);
    const bs = await this.getButtons(data.HostBy);
    bs.find(x => (x.data as any).label == "Enter")
      .setDisabled(true)
      .setStyle(ButtonStyle.Secondary);
    bs.find(x => (x.data as any).label == "End")
      .setDisabled(true)
      .setStyle(ButtonStyle.Secondary);
    bs.find(x => (x.data as any).label == "Reroll")
      .setDisabled(false)
      .setStyle(ButtonStyle.Success);
    const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(bs);
    m.edit({
      components: [row],
      embeds: m.embeds,
    }).catch(e => {
      throw new CathError(e);
    });
  }

  private async giveawayEmbed(
    client: Client,
    status: string,
    { host, prize, endAfter, invites, winners, requirements }
  ) {
    const hostedBy =
      client.users.cache.get(host) ||
      (await client.users.fetch(host).catch(() => null));
    let req = "";
    if (requirements.Roles)
      req += `\n Role(s): ${requirements.Roles.map(x => `<@&${x}>`).join(
        ", "
      )}`;
    if (requirements.weeklyamari)
      req += `\n Weekly Amari: \`${requirements.weeklyamari}\``;
    if (requirements.amarilevel)
      req += `\n Amari Level: \`${requirements.amarilevel}\``;
    const embed = new EmbedBuilder()
      .setTitle(`Status: ${status}! 🎉`)
      .setDescription(
        `${this.GiveawayMessages.toParticipate
        }\n${this.GiveawayMessages.giveawayDescription
          .replace(/{invites}/g, invites ? invites : "0")
          .replace(/{requirements}/g, req)
          .replace(/{hostedBy}/g, hostedBy || "Can't find the user")
          .replace(/{award}/g, prize)
          .replace(/{winners}/g, winners)
          .replace(/{totalParticipants}/g, "0")}`
      )
      .setColor("Random")
      .setFooter({
        text: "Ends",
        iconURL: this.GiveawayMessages.giveawayFooterImage,
      })
      .setTimestamp(Date.now() + parseString(endAfter));
    return embed;
  }

  public async create(
    client: Client,
    { prize, host, winners, endAfter, invites, requirements, Channel }
  ) {
    if (!client)
      throw new CathError("client wasnt provided while creating giveaway!");
    if (!prize)
      throw new CathError("prize wasnt provided while creating giveaway!");
    if (typeof prize !== "string")
      throw new TypeError("prize should be a string");
    if (!host)
      throw new CathError("host wasnt provided while creating giveaway");
    if (!winners)
      throw new CathError(
        "winner count wasnt provided while creating giveaway"
      );
    if (isNaN(winners)) throw new TypeError("winners should be a Number");
    if (!endAfter)
      throw new CathError("time wasnt provided while creating giveaway");
    if (typeof endAfter !== "string")
      throw new TypeError("endAfter should be a string");
    if (
      invites < 0 &&
      invites == null &&
      invites == undefined &&
      typeof invites !== "number"
    ) {
      throw new CathError("invites wasnt provided while creating giveaway");
    }
    if (!Channel)
      throw new CathError("channel ID wasnt provided while creating giveaway");
    const status = "In Progress";
    const msg = await (client.channels.cache.get(Channel) as TextChannel).send({
      content: this.GiveawayMessages.giveaway,
      components: [new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(this.getButtons(host))],
      embeds: [
        await this.giveawayEmbed(client, status, {
          host,
          prize,
          endAfter,
          invites,
          winners,
          requirements,
        }),
      ],
    });

    const data = await new this.schema({
      Message: msg.id,
      Channel: Channel,
      Guild: msg.guild.id,
      HostBy: host,
      Winners: winners,
      Award: prize,
      Start: Date.now(),
      End: Date.now() + parseString(endAfter),
      Invites: invites,
      Requirements: requirements,
    }).save();
    await this.startTimer(msg, data);
  }

  private async startTimer(message: Message, data, instant = false) {
    if (!message) throw new CathError("Missing 'message'");
    if (!data) throw new CathError("Missing 'data'");
    const msg = await (
      message.guild.channels.cache.get(data.Channel) as TextChannel
    ).messages.fetch(data.Message);
    await msg.fetch();
    const time = instant ? 0 : data.End - Date.now();
    setTimeout(async () => {
      const winners = await this.choose(data.winners, data.Message, message);
      if (!winners) {
        msg.channel.send({
          content: this.replacePlaceholders(
            this.GiveawayMessages.noWinner,
            data,
            msg
          ),
        });
        data.Ended = true;
        data.save();
        const embed = EmbedBuilder.from(msg.embeds[0]);
        embed.setDescription(this.replacePlaceholders(
          this.GiveawayMessages.giveawayDescription,
          data,
          msg
        ));
        msg.edit({ embeds: [embed] });
        this.editButtons(message.client, data);
        return "NO_WINNERS";
      }
      (message.channel as TextChannel).send({
        content: this.replacePlaceholders(
          this.GiveawayMessages.winMessage,
          await this.getByMessage(data.Message),
          msg,
          winners as []
        ),
      });

      if (this.GiveawayMessages.dmWinner) {
        const dmEmbed = new EmbedBuilder()
          .setTitle("You Won!")
          .setDescription(
            this.replacePlaceholders(
              this.GiveawayMessages.dmMessage,
              data,
              msg,
              winners as []
            )
          )
          .setColor("Random")
          .setTimestamp()
          .setThumbnail(msg.guild.iconURL())
          .setFooter({ text: "Made by Cath Team" });
        (winners as []).forEach(user => {
          message.guild.members.cache.get(user).send({ embeds: [dmEmbed] });
        });
      }

      const embed = EmbedBuilder.from(msg.embeds[0]);
      embed.setDescription(this.replacePlaceholders(
        this.GiveawayMessages.giveawayDescription,
        data,
        msg,
        winners as []
      ));
      msg.edit({ embeds: [embed] }).catch(err => console.log(err));
      data.Ended = true;
      data.save().catch(err => {
        console.log(err);
      });
      this.editButtons(message.client, data);
    }, time);
  }
  private gotoGiveaway(data) {
    if (!data) throw new CathError("Missing 'data'");
    const link = `https://discord.com/channels/${data.Guild}/${data.Channel}/${data.Message}`;
    const button = new ButtonBuilder()
      .setLabel("Giveaway")
      .setStyle(ButtonStyle.Link)
      .setURL(link);
    return button;
  }
  private async endByButton(
    client: Client,
    Message: Snowflake,
    button: ButtonInteraction
  ) {
    if (!client) throw new CathError("Missing 'client'");
    if (!Message) throw new CathError("Missing 'Message'");
    if (!button) throw new CathError("Missing 'button'");
    const data = await this.getByMessage(Message);
    const msg = await (
      client.guilds.cache
        .get(data.Guild)
        .channels.cache.get(data.Channel) as TextChannel
    ).messages.fetch(Message);
    const res = await this.end(msg, data, msg);
    if (res == "ENDED")
      await button.followUp({
        content: this.replacePlaceholders(
          this.GiveawayMessages.alreadyEnded,
          data,
          msg
        ),
      });
  }

  public async end(message: Message, data, giveawaymsg: Message) {
    if (!message) throw new CathError("Missing 'Message'");
    if (!data) throw new CathError("Missing 'data'");
    if (!giveawaymsg) throw new CathError("Missing 'Message'");
    const newData = await this.getByMessage(data.Message);
    if (newData.Ended) return "ENDED";
    const winners = await this.choose(data.Winners, message.id, message);
    const msg = await (
      message.client.guilds.cache
        .get(data.Guild)
        .channels.cache.get(data.Channel) as TextChannel
    ).messages.fetch(data.Message);

    if (!winners) {
      (message.channel as TextChannel).send(
        this.replacePlaceholders(this.GiveawayMessages.noWinner, newData, msg)
      );
      data.Ended = true;
      await data.save();
      const embed = EmbedBuilder.from(giveawaymsg.embeds[0]);
      embed.setDescription(this.replacePlaceholders(
        this.GiveawayMessages.giveawayDescription,
        newData,
        msg
      ));
      embed.setTitle("Status: Ended! 🎉");
      giveawaymsg.edit({ embeds: [embed] }).catch(err => console.log(err));
      this.editButtons(message.client, data);
      return "NO_WINNERS";
    }
    (message.channel as TextChannel).send(
      this.replacePlaceholders(
        this.GiveawayMessages.winMessage,
        newData,
        msg,
        winners as []
      )
    );
    if (this.GiveawayMessages.dmWinner) {
      const dmEmbed = new EmbedBuilder()
        .setTitle("You Won!")
        .setDescription(
          this.replacePlaceholders(
            this.GiveawayMessages.dmMessage,
            newData,
            msg,
            winners as []
          )
        )
        .setColor("Random")
        .setTimestamp()
        .setThumbnail(msg.guild.iconURL())
        .setFooter({ text: "Made by Cath Team" });
      (winners as []).forEach(user => {
        message.guild.members.cache
          .get(user)
          .send({ embeds: [dmEmbed] })
          .catch();
      });
    }

    const embed = EmbedBuilder.from(giveawaymsg.embeds[0]);
    embed.setDescription(this.replacePlaceholders(
      this.GiveawayMessages.giveawayDescription,
      data,
      msg,
      winners as []
    ));
    embed.setTitle("Status: Ended! 🎉");
    giveawaymsg.edit({ embeds: [embed] }).catch(err => console.log(err));
    data.Ended = true;
    data.save().catch(err => {
      console.log(err);
    });
    this.editButtons(message.client, data);
  }
  public async reroll(client: Client, Message: Snowflake, message: Message) {
    if (!client) throw new CathError("Missing 'client'");
    if (!Message) throw new CathError("Missing 'Message'");
    const data = await this.getByMessage(Message);
    const msg = await (
      client.guilds.cache
        .get(data.Guild)
        .channels.cache.get(data.Channel) as TextChannel
    ).messages.fetch(Message);
    const embed = EmbedBuilder.from(message.embeds[0]);
    embed.setTitle("Status: Rerolled! 🎉");
    message.edit({ embeds: [embed] }).catch(err => console.log(err));
    const chosen = await this.choose(1, Message, message);
    if (!chosen) return [];
    const dmEmbed = new EmbedBuilder()
      .setTitle("You Won!")
      .setDescription(
        this.replacePlaceholders(
          this.GiveawayMessages.dmMessage,
          data,
          msg,
          chosen as []
        )
      )
      .setColor("Random")
      .setTimestamp()
      .setThumbnail(msg.guild.iconURL())
      .setFooter({ text: "Made by Cath Team" });
    (chosen as []).forEach(user => {
      client.users.cache.get(user).send({ embeds: [dmEmbed] });
    });
    return chosen;
  }
  public async getByMessage(Message: Snowflake) {
    const doc = await this.schema.findOne({ Message: Message });
    if (!doc) return;
    return doc;
  }
  public async start(client: Client) {
    await this.schema.find({ Ended: false }).then(data => {
      setTimeout(async () => {
        data.forEach(async e => {
          const guild = await client.guilds.fetch(e.Guild);
          if (!guild) await e.deleteOne();
          const channel = guild.channels.cache.get(e.Channel) as TextChannel;
          if (!channel) await e.deleteOne();
          const msg = await channel.messages.fetch(e.Message).catch();
          if (!msg) await e.deleteOne();
          this.startTimer(msg, e);
        });
      }, 10000);
    });
    if (this.GiveawayMessages.editParticipants) {
      setInterval(async () => {
        const docs = await this.schema.find({ Ended: false });
        for (let i = 0; i < docs.length; i++) {
          const guild = client.guilds.cache.get(docs[i].Guild);
          if (!guild) return;
          const channel = (await guild.channels.fetch(
            docs[i].Channel
          )) as TextChannel;
          if (!channel) return;
          const msg = await channel.messages.fetch(docs[i].Message);
          if (!msg) return;
          const embed = EmbedBuilder.from(msg.embeds[0]);
          const req = docs[i].Requirements.Enabled
            ? docs[i].Requirements.Roles.map(x => `<@&${x}>`).join(", ")
            : "None!";
          embed.setDescription(`${this.GiveawayMessages.toParticipate
            }\n${this.GiveawayMessages.giveawayDescription
              .replace(/{invites}/g, docs[i].Invites.toString())
              .replace(/{requirements}/g, req)
              .replace(/{hostedBy}/g, `<@!${docs[i].HostBy}>`)
              .replace(/{award}/g, docs[i].Award)
              .replace(/{winners}/g, docs[i].Winners.toString())
              .replace(
                /{totalParticipants}/g,
                docs[i].Clickers.length.toString()
              )}`);
          msg.edit({ embeds: [embed] });
        }
      }, 10 * 1000);
    }
  }

  private replacePlaceholders(
    string: string,
    data: GiveawaySchema,
    msg: Message,
    winners = []
  ) {
    const newString = string
      .replace(/{invites}/g, data.Invites.toString())
      .replace(
        /{requirements}/g,
        data.Requirements.Enabled
          ? data.Requirements.Roles.map(x => `<@&${x}>`).join(", ")
          : "None!"
      )
      .replace(/{guildName}/g, msg.guild.name)
      .replace(/{totalParticipants}/g, data.Clickers.length.toString())
      .replace(/{award}/g, data.Award)
      .replace(
        /{giveawayURL}/g,
        `https://discord.com/channels/${msg.guild.id}/${msg.channel.id}/${data.Message}`
      )
      .replace(
        /{hostedBy}/g,
        msg.guild.members.cache.get(data.HostBy).toString()
      )
      .replace(
        /{winners}/g,
        winners.length > 0
          ? winners.map(winner => `<@${winner}>`).join(", ")
          : "None"
      );
    return newString;
  }
}
