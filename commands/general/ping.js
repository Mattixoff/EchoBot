const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'ping',
    description: 'Responds with Pong! and shows bot latency',
    category: 'General',
    cooldown: 5,
    enabled: true,
    
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Responds with Pong! and shows bot latency'),
    
    async execute(interaction) {
        const sent = await interaction.reply({ content: '🏓 Pong!', fetchReply: true });
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        
        await interaction.editReply(`🏓 Pong! Latency: ${latency}ms | API: ${Math.round(interaction.client.ws.ping)}ms`);
    }
};
