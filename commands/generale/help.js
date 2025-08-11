const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config.js');

module.exports = {
    name: 'help',
    description: 'Mostra tutti i comandi disponibili',
    category: 'Generale',
    cooldown: 3,
    enabled: true,
    
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Mostra tutti i comandi disponibili')
        .addStringOption(option =>
            option.setName('comando')
                .setDescription('Nome del comando per informazioni dettagliate')
                .setRequired(false)),
    
    async execute(interaction) {
        const commandHandler = interaction.client.commandHandler;
        const categories = commandHandler.getCategories();
        const commandName = interaction.options.getString('comando');
        
        // Se è specificato un comando specifico
        if (commandName) {
            const command = commandHandler.getAllCommands().get(commandName);

            if (command) {
                const commandEmbed = new EmbedBuilder()
                    .setColor(config.embed.colors.primary)
                    .setTitle(`📋 Comando: ${command.name}`)
                    .addFields(
                        { name: 'Descrizione', value: command.description || 'Nessuna descrizione' },
                        { name: 'Categoria', value: command.category || 'Generale', inline: true },
                        { name: 'Cooldown', value: `${command.cooldown || 0}s`, inline: true }
                    )
                    .setTimestamp();

                if (command.usage) {
                    commandEmbed.addFields({ name: 'Uso', value: `\`/${command.name} ${command.usage}\`` });
                }

                if (command.examples) {
                    commandEmbed.addFields({ name: 'Esempi', value: command.examples.map(ex => `\`/${ex}\``).join('\n') });
                }

                return interaction.reply({ embeds: [commandEmbed] });
            } else {
                return interaction.reply({ 
                    content: `\`❌\` **Comando \`${commandName}\` non trovato.**`,
                    ephemeral: true 
                });
            }
        }

        // Mostra tutti i comandi per categoria
        const embed = new EmbedBuilder()
            .setColor(config.embed.colors.primary)
            .setTitle('🤖 Comandi Disponibili')
            .setDescription(`Usa \`/help <comando>\` per informazioni dettagliate su un comando specifico.`)
            .setTimestamp()
            .setFooter({ text: `Richiesto da ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

        categories.forEach((commands, category) => {
            const commandList = commands
                .filter(cmd => cmd.enabled)
                .map(cmd => `\`${cmd.name}\``)
                .join(', ');

            if (commandList) {
                embed.addFields({
                    name: `${getCategoryEmoji(category)} ${category}`,
                    value: commandList || 'Nessun comando disponibile',
                    inline: false
                });
            }
        });

        await interaction.reply({ embeds: [embed] });
    }
};

function getCategoryEmoji(category) {
    const emojis = {
        'Generale': '📋',
        'Moderazione': '🛡️',
        'Divertimento': '🎮',
        'Utilità': '🔧',
        'Admin': '⚙️'
    };
    return emojis[category] || '📁';
}
