import { hyperlink, SlashCommandBuilder } from "discord.js";
import { Command } from "../../structures/handlers/Command";
import { category } from "../../../typings/enums/category";

export default new Command({
    data: new SlashCommandBuilder()
    .setName('invite')
    .setDescription(`Invite me into your guild`),
    category: category.utils,
    cooldown: 10_000,
    run({ client, interaction }) {
        console.log('Huh')
        interaction.reply(`${hyperlink(`Click this to invite me!`, `https://discord.com/oauth2/authorize?client_id=${client.user!.id}&permissions=8&scope=bot`)}`);
    },
});