import chalk from "chalk";
import { client } from "../..";
import Event from "../../structures/handlers/Event";
import { ChannelType, ChatInputCommandInteraction, Collection, MessageFlags } from "discord.js"; 
import IUserSchema from "../../database/interfaces/IUserSchema";

// A simple map to track cooldowns
const cooldowns: Map<string, Map<string, number>> = new Map();

export default new Event('interactionCreate', async (interaction) => {
    // Ensure the interaction is a slash command
    if (interaction.user.bot) return;
    if (!(interaction instanceof ChatInputCommandInteraction)) return;

    const commandName = interaction.commandName;
    const command = client.commands.get(commandName);
    // If command doesn't exist
    if (!command) {
        return interaction.reply({ content: 'This command is not recognized.', flags: MessageFlags.Ephemeral });
    };
    const subCommandCheck = interaction.options.getSubcommand();
    const subCommand = client.commands.get(`${command.data.name}_${subCommandCheck}`);

    if (!subCommand) {
        return interaction.reply({ content: 'This command is not recognized.', flags: MessageFlags.Ephemeral });
    };
    if(subCommand.ownerOnly && !client.config.owners.includes(interaction.user.id)) return interaction.reply({
        content: `Nice try, but it is only for owner...`,
        flags: MessageFlags.Ephemeral,
    });
    // Check if the command has a cooldown
    if (command.cooldown) {
        const now = Date.now();
        const commandKey = `${command.data.name}_${subCommandCheck || "default"}`; // Ensures a unique key
    
        // Ensure the cooldown map exists
        if (!cooldowns.has(commandKey)) {
            cooldowns.set(commandKey, new Map());
        }
    
        const userCooldowns = cooldowns.get(commandKey)!;
        const cooldownTime = userCooldowns.get(interaction.user.id);
    
        if (cooldownTime && now < cooldownTime) {
            const timeLeft = Math.floor((cooldownTime - now) / 1000); // Convert ms to seconds
            return interaction.reply({
                content: `⏳ Please wait **${timeLeft} seconds** before using this command again.`,
                ephemeral: true
            });
        }
    
        // Set cooldown for user
        const expireTime = now + command.cooldown;
        userCooldowns.set(interaction.user.id, expireTime);
    
        // Clear cooldown after expiry
        setTimeout(() => {
            userCooldowns.delete(interaction.user.id);
            if (userCooldowns.size === 0) cooldowns.delete(commandKey); // Clean up memory
        }, command.cooldown);
    }
    
    

    // Run the command
    try {
        if(interaction.channel!.type === ChannelType.GuildText) {
            let data = await client.db.user.getData(interaction.user!.id, interaction.guild!.id);
            if(!data) data = await client.db.user.createUser(interaction.user!.id, interaction.guild!.id);

            client.db.user.updateUser(interaction.user!.id, interaction.guild!.id);
        } else {
            let data = await client.db.user.getData(interaction.user!.id, client.user!.id);
            if(!data) data = await client.db.user.createUser(interaction.user!.id, client.user!.id);
            client.db.user.updateUser(interaction.user!.id, client.user!.id);
        }
        await command.run({ interaction, client });
    } catch (error) {
        console.error(chalk.red(`Error running command ${commandName}:`), error);
        interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
});