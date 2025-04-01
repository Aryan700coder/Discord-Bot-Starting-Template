import path from "path";
import ExtendedClient from "../ExtendedClient";
import fs from 'fs';
import { ApplicationCommandOptionType, ClientEvents, Collection, REST, Routes, SlashCommandBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import Event from "./Event";
import chalk from "chalk";
import ICommand from "../../../typings/interfaces/ICommand";
import { category } from "../../../typings/enums/category";
import IRunOptions from "../../../typings/interfaces/IRunOptions";

export default class Handler {
    client: ExtendedClient;

    constructor(client: ExtendedClient) {
        this.client = client;
        this.client.commands = new Collection();
    }

    private async importFile(filePath: string) {
        return (await import(filePath))?.default;
    }

    async LoadEvents() {
        const eventFolders = fs.readdirSync(path.join(__dirname, '../../events'));

        for (const folder of eventFolders) {
            const eventFile = fs.readdirSync(path.join(__dirname, '../../events', folder));
            for (const file of eventFile) {
                if (!file) continue;
                const event: Event<keyof ClientEvents> = await this.importFile(path.join(__dirname, '../../events', folder, file));
                if (!event || !event.event) continue;
                this.client.logger.info(`Event Loaded: ${chalk.reset.whiteBright(event.event)}`);
                this.client.on(event.event, event.run);
            }
        }
    }

    async LoadCommands() {
        const commandFolders = fs.readdirSync(path.join(__dirname, '../../commands'));

        for (const folder of commandFolders) {
            const commandFiles = fs.readdirSync(path.join(__dirname, '../../commands', folder));

            // Create the main command based on the folder name (Main Command)
            const mainCommand = new SlashCommandBuilder()
                .setName(folder.toLowerCase())
                .setDescription(`Main command: ${folder}`);

            let hasSubCommands = false;

            for (const file of commandFiles) {
                
                if (!file) continue;

                const filePath = path.join(__dirname, '../../commands', folder, file);
                const command: ICommand = await this.importFile(filePath);

                if (!command || !command.data) {
                    continue;
                }

                // Log and add subcommands to the main command
                this.client.logger.info(`Subcommand Loaded: ${chalk.reset.whiteBright(command.data.name)} under ${folder}`);

                this.client.commands.set(`${mainCommand.name}_${command.data.name}`, {
                    data: command.data,
                    category: command.category,
                    run: command.run,
                    ownerOnly: command.ownerOnly || false,
                });
                mainCommand.addSubcommand((sub: SlashCommandSubcommandBuilder) => {
                    sub.setName(command.data.name.toLowerCase())
                        .setDescription(command.data.description);

                    // Add any options (parameters) for the subcommand
                    if (command.data.options) {
                        for (const option of command.data.options) {
                            switch (option.toJSON().type) {
                                case ApplicationCommandOptionType.String:
                                    sub.addStringOption(o =>
                                        o.setName(option.toJSON().name)
                                            .setDescription(option.toJSON().description)
                                            .setRequired(option.toJSON().required ?? false)
                                    );
                                    break;
                                case ApplicationCommandOptionType.Integer:
                                    sub.addIntegerOption(o =>
                                        o.setName(option.toJSON().name)
                                            .setDescription(option.toJSON().description)
                                            .setRequired(option.toJSON().required ?? false)
                                    );
                                    break;
                                case ApplicationCommandOptionType.Boolean:
                                    sub.addBooleanOption(o =>
                                        o.setName(option.toJSON().name)
                                            .setDescription(option.toJSON().description)
                                            .setRequired(option.toJSON().required ?? false)
                                    );
                                    break;
                                case ApplicationCommandOptionType.Role:
                                    sub.addRoleOption(o =>
                                        o.setName(option.toJSON().name)
                                            .setDescription(option.toJSON().description)
                                            .setRequired(option.toJSON().required ?? false)
                                    );
                                    break;
                                case ApplicationCommandOptionType.Attachment:
                                    sub.addAttachmentOption(o =>
                                        o.setName(option.toJSON().name)
                                            .setDescription(option.toJSON().description)
                                            .setRequired(option.toJSON().required ?? false)
                                    );
                                    break;
                                case ApplicationCommandOptionType.Channel:
                                    sub.addChannelOption(o =>
                                        o.setName(option.toJSON().name)
                                            .setDescription(option.toJSON().description)
                                            .setRequired(option.toJSON().required ?? false)
                                    );
                                    break;
                                case ApplicationCommandOptionType.User:
                                    sub.addUserOption(o =>
                                        o.setName(option.toJSON().name)
                                            .setDescription(option.toJSON().description)
                                            .setRequired(option.toJSON().required ?? false)
                                    );
                                    break;
                            }
                        }
                    }

                    return sub;
                });

                hasSubCommands = true;
            }

            // Now only register the main command once and link subcommands to it
            if (hasSubCommands) {
                this.client.commands.set(mainCommand.name, {
                    data: mainCommand,
                    category: category.utils,
                    run: async ({ interaction, client }: IRunOptions) => {
                        const subCommandName = interaction.options.getSubcommand();
                        const subCommand = this.client.commands.get(`${mainCommand.name}_${subCommandName}`);

                        if (subCommand) {
                            await subCommand.run({ client, interaction });
                        } else {
                            interaction.reply({
                                content: 'This subcommand does not exist.',
                                ephemeral: true
                            });
                        }
                    }
                });
            }

            // Register each subcommand as a part of the main command
            // for (const file of commandFiles) {
            //     if (!file) continue;
            //     const filePath = path.join(__dirname, '../../commands', folder, file);
            //     const command: ICommand = await this.importFile(filePath);

            //     if (!command || !command.data) continue;

            //     // Log each subcommand loaded
            //     this.client.logger.info(`Subcommand Loaded: ${chalk.reset.whiteBright(command.data.name)} under ${folder}`);

            //     this.client.commands.set(`${mainCommand.name}_${command.data.name}`, {
            //         data: command.data,
            //         category: command.category,
            //         run: command.run,
            //         ownerOnly: command.ownerOnly || false,
            //     });
            // }
        }
    }

    async RegisterCommands() {
        const rest = new REST({ version: "10" }).setToken(this.client.config.token);
        const mainCommands = this.client.commands.filter((_, key) => !key.includes('_'));
        const commandsData = mainCommands.map((cmd) => cmd.data);
        try {
            this.client.logger.info("📢 Refreshing application (/) commands...");

            if (this.client.config.environment === "DEV") {
                await rest.put(
                    Routes.applicationGuildCommands(this.client.config.clientId, this.client.config.guildId),
                    { body: commandsData }
                );
                this.client.logger.success("✅ Successfully registered guild commands!");
            } else {
                await rest.put(
                    Routes.applicationCommands(this.client.config.clientId),
                    { body: commandsData }
                );
                this.client.logger.success('✅ Successfully registered global commands!');
            }
        } catch (error) {
            this.client.logger.error(error);
        }
    }
}
