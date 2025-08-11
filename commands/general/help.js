const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config.js');

module.exports = {
    name: 'help',
    description: 'Shows all available commands',
    category: 'General',
    cooldown: 3,
    enabled: true,
    
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows all available commands')
        .addStringOption(option =>
            option.setName('command')
                .setDescription('Command name for detailed information')
                .setRequired(false)),
    
    async execute(interaction) {
        const commandHandler = interaction.client.commandHandler;
        const categories = commandHandler.getCategories();
        const commandName = interaction.options.getString('command');
        
        // If a specific command is specified
        if (commandName) {
            const command = commandHandler.getAllCommands().get(commandName);

            if (command) {
                const commandEmbed = new EmbedBuilder()
                    .setColor(config.embed.colors.primary)
                    .setTitle(`📋 Command: ${command.name}`)
                    .addFields(
                        { name: 'Description', value: command.description || 'No description' },
                        { name: 'Category', value: command.category || 'General', inline: true },
                        { name: 'Cooldown', value: `${command.cooldown || 0}s`, inline: true }
                    )
                    .setTimestamp();

                if (command.usage) {
                    commandEmbed.addFields({ name: 'Usage', value: `\`/${command.name} ${command.usage}\`` });
                }

                if (command.examples) {
                    commandEmbed.addFields({ name: 'Examples', value: command.examples.map(ex => `\`/${ex}\``).join('\n') });
                }

                return interaction.reply({ embeds: [commandEmbed] });
            } else {
                return interaction.reply({ 
                    content: `\`❌\` **Command \`${commandName}\` not found.**`,
                    ephemeral: true 
                });
            }
        }

        // Show all commands by category
        const embed = new EmbedBuilder()
            .setColor(config.embed.colors.primary)
            .setTitle('🤖 Available Commands')
            .setDescription(`Use \`/help <command>\` for detailed information about a specific command.`)
            .setTimestamp()
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

        categories.forEach((commands, category) => {
            const commandList = commands
                .filter(cmd => cmd.enabled)
                .map(cmd => `\`${cmd.name}\``)
                .join(', ');

            if (commandList) {
                embed.addFields({
                    name: `${getCategoryEmoji(category)} ${category}`,
                    value: commandList || 'No commands available',
                    inline: false
                });
            }
        });

        await interaction.reply({ embeds: [embed] });
    }
};

function getCategoryEmoji(category) {
    const emojis = {
        'General': '📋',
        'Moderation': '🛡️',
        'Entertainment': '🎮',
        'Utility': '🔧',
        'Administration': '⚙️'
    };
    return emojis[category] || '📁';
}
