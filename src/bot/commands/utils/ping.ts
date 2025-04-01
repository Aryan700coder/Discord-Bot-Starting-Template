import { SlashCommandBuilder } from "discord.js";
import { Command } from "../../structures/handlers/Command";
import { category } from "../../../typings/enums/category";

export default new Command({
    data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription(`Replies with pong`),
    category: category.utils,
    cooldown: 3000,
    run({ client, interaction }) {
        interaction.reply(`${client.ws.ping}ms`);
    },
});