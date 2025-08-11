const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const config = require('../../config.js');

module.exports = {
    name: 'userinfo',
    description: 'Shows information about a user',
    category: 'Utility',
    cooldown: 5,
    enabled: true,
    permissions: [PermissionsBitField.Flags.ViewAuditLog],
    
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Shows information about a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user whose information you want to see')
                .setRequired(false)),
    
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const targetMember = interaction.guild.members.cache.get(targetUser.id);
        
        if (!targetMember) {
            return interaction.reply({ 
                content: '`❌` **User not found in this server.**',
                ephemeral: true 
            });
        }
        
        const roles = targetMember.roles.cache
            .filter(role => role.id !== interaction.guild.id)
            .map(role => role.name)
            .join(', ') || 'No roles';
        
        const permissions = targetMember.permissions.toArray();
        const keyPermissions = permissions.slice(0, 10).join(', ') || 'No special permissions';
        
        const embed = new EmbedBuilder()
            .setColor(config.embed.colors.primary)
            .setTitle(`👤 Information about ${targetUser.username}`)
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: '🆔 User ID', value: targetUser.id, inline: true },
                { name: '📅 Account created', value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '📥 Joined server', value: `<t:${Math.floor(targetMember.joinedTimestamp / 1000)}:R>`, inline: true },
                { name: '🎭 Roles', value: roles.length > 1024 ? 'Too many roles to display' : roles, inline: false },
                { name: '🔑 Key permissions', value: keyPermissions.length > 1024 ? 'Too many permissions to display' : keyPermissions, inline: false }
            )
            .setTimestamp()
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });
        
        await interaction.reply({ embeds: [embed] });
    }
};
