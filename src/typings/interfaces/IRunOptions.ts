import { ChatInputCommandInteraction } from "discord.js";
import ExtendedClient from "../../bot/structures/ExtendedClient";

export default interface IRunOptions {
    interaction: ChatInputCommandInteraction;
    client: ExtendedClient;
}