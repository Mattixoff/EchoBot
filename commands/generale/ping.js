const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'ping',
    description: 'Risponde con Pong! e mostra la latenza del bot',
    category: 'Generale',
    cooldown: 5,
    enabled: true,
    
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Risponde con Pong! e mostra la latenza del bot'),
    
    async execute(interaction) {
        const sent = await interaction.reply({ content: '🏓 Pong!', fetchReply: true });
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        
        await interaction.editReply(`🏓 Pong! Latenza: ${latency}ms | API: ${Math.round(interaction.client.ws.ping)}ms`);
    }
};
