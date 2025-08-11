const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config.js');

module.exports = {
    name: '8ball',
    description: 'Ask a question to the magic ball',
    category: 'Entertainment',
    cooldown: 10,
    enabled: true,
    
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Ask a question to the magic ball')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('Your question for the magic ball')
                .setRequired(true)),
    
    async execute(interaction) {
        const question = interaction.options.getString('question');
        
        const responses = [
            '🔮 It is certain',
            '🔮 It is decidedly so',
            '🔮 Without a doubt',
            '🔮 Yes, definitely',
            '🔮 You can count on it',
            '🔮 As I see it, yes',
            '🔮 Most likely',
            '🔮 Outlook good',
            '🔮 Yes',
            '🔮 Signs point to yes',
            '🔮 Reply hazy, try again',
            '🔮 Ask again later',
            '🔮 Better not tell you now',
            '🔮 Cannot predict now',
            '🔮 Concentrate and ask again',
            '🔮 Don\'t count on it',
            '🔮 My reply is no',
            '🔮 My sources say no',
            '🔮 Outlook not so good',
            '🔮 Very doubtful'
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const embed = new EmbedBuilder()
            .setColor(config.embed.colors.primary)
            .setTitle('🎱 Magic Ball')
            .addFields(
                { name: '❓ Question', value: question, inline: false },
                { name: '🔮 Answer', value: randomResponse, inline: false }
            )
            .setTimestamp()
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });
        
        await interaction.reply({ embeds: [embed] });
    }
};
