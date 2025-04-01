import { SharedSlashCommand, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } from "discord.js";
import { category } from "../enums/category";
import IRunOptions from "./IRunOptions";

export default interface ICommand {
    data: SlashCommandOptionsOnlyBuilder;
    cooldown?: number;
    category: category;
    subcommands?: Map<any, any>;
    ownerOnly?: boolean;
    run: (options: IRunOptions) => any; 
}