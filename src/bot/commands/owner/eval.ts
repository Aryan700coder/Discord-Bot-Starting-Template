import { APIEmbedField, EmbedBuilder, SharedSlashCommand, SlashCommandBuilder } from "discord.js";
import { Command } from "../../structures/handlers/Command";
import { category } from "../../../typings/enums/category";

export default new Command({
    data: new SlashCommandBuilder()
    .setName('eval')
    .setDescription(`Only For Owner`)
    .addStringOption(input => input.setName('input')
.setDescription(`The input to eval`)
.setRequired(true)),
    category: category.owner,
    cooldown: 3000,
    ownerOnly: true, 
    async run({ client, interaction }) {
        const input = interaction.options.getString('input', true);
        const embed = new EmbedBuilder()
        .addFields([
            {
                name: `Response`,
                value: '',
                inline: false,
            },
        ])
        .setColor(client.config.embedColor.default);
        try {
            // Evaluate (execute) our input
            const evaled = eval(input);
      
            // Put our eval result through the function
            // we defined above
            const cleaned = await clean(evaled);
            const [value] = embed.data.fields as APIEmbedField[];
            value.value = `\`\`\`js\n${cleaned}\n\`\`\``
            // Reply in the channel with our result
            interaction.reply({
                embeds: [embed]
            });
          } catch (err) {
            // Reply in the channel with our error
            const [value] = embed.data.fields as APIEmbedField[];
            value.value = `\`\`\`js\n${err}\n\`\`\``
            // Reply in the channel with our result
            interaction.reply({
                embeds: [embed]
            });
          }
    },
});

async function clean(text: string) {
    // If our input is a promise, await it before continuing
    if (text && text.constructor.name == "Promise")
      text = await text;
    
    // If the response isn't a string, `util.inspect()`
    // is used to 'stringify' the code in a safe way that
    // won't error out on objects with circular references
    // (like Collections, for example)
    if (typeof text !== "string")
      text = require("util").inspect(text, { depth: 1 });
    
    // Replace symbols with character code alternatives
    text = text
      .replace(/`/g, "`" + String.fromCharCode(8203))
      .replace(/@/g, "@" + String.fromCharCode(8203));
    
    // Send off the cleaned up result
    return text;
    }