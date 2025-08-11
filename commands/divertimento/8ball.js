const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config.js');

module.exports = {
    name: '8ball',
    description: 'Fai una domanda alla palla magica',
    category: 'Divertimento',
    cooldown: 10,
    enabled: true,
    
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Fai una domanda alla palla magica')
        .addStringOption(option =>
            option.setName('domanda')
                .setDescription('La tua domanda per la palla magica')
                .setRequired(true)),
    
    async execute(interaction) {
        const question = interaction.options.getString('domanda');
        
        const responses = [
            '🔮 È certo',
            '🔮 È decisamente così',
            '🔮 Senza dubbio',
            '🔮 Sì, decisamente',
            '🔮 Puoi contare su di esso',
            '🔮 Come lo vedo io, sì',
            '🔮 Molto probabilmente',
            '🔮 Le prospettive sono buone',
            '🔮 Sì',
            '🔮 I segni indicano di sì',
            '🔮 Risposta nebulosa, riprova',
            '🔮 Chiedi più tardi',
            '🔮 Meglio non dirtelo ora',
            '🔮 Non posso prevederlo ora',
            '🔮 Concentrati e chiedi di nuovo',
            '🔮 Non ci contare',
            '🔮 La mia risposta è no',
            '🔮 Le mie fonti dicono di no',
            '🔮 Le prospettive non sono così buone',
            '🔮 Molto dubbio'
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const embed = new EmbedBuilder()
            .setColor(config.embed.colors.primary)
            .setTitle('🎱 Palla Magica')
            .addFields(
                { name: '❓ Domanda', value: question, inline: false },
                { name: '🔮 Risposta', value: randomResponse, inline: false }
            )
            .setTimestamp()
            .setFooter({ text: `Richiesto da ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });
        
        await interaction.reply({ embeds: [embed] });
    }
};
