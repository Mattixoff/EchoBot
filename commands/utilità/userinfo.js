const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const config = require('../../config.js');

module.exports = {
    name: 'userinfo',
    description: 'Mostra informazioni su un utente',
    category: 'Utilità',
    cooldown: 5,
    enabled: true,
    permissions: [PermissionsBitField.Flags.ViewAuditLog],
    
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Mostra informazioni su un utente')
        .addUserOption(option =>
            option.setName('utente')
                .setDescription('L\'utente di cui vuoi vedere le informazioni')
                .setRequired(false)),
    
    async execute(interaction) {
        const targetUser = interaction.options.getUser('utente') || interaction.user;
        const targetMember = interaction.guild.members.cache.get(targetUser.id);
        
        if (!targetMember) {
            return interaction.reply({ 
                content: '`❌` **Utente non trovato in questo server.**',
                ephemeral: true 
            });
        }
        
        const roles = targetMember.roles.cache
            .filter(role => role.id !== interaction.guild.id)
            .map(role => role.name)
            .join(', ') || 'Nessun ruolo';
        
        const permissions = targetMember.permissions.toArray();
        const keyPermissions = permissions.slice(0, 10).join(', ') || 'Nessun permesso speciale';
        
        const embed = new EmbedBuilder()
            .setColor(config.embed.colors.primary)
            .setTitle(`👤 Informazioni su ${targetUser.username}`)
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: '🆔 ID Utente', value: targetUser.id, inline: true },
                { name: '📅 Account creato', value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '📥 Entrato nel server', value: `<t:${Math.floor(targetMember.joinedTimestamp / 1000)}:R>`, inline: true },
                { name: '🎭 Ruoli', value: roles.length > 1024 ? 'Troppi ruoli per visualizzarli' : roles, inline: false },
                { name: '🔑 Permessi chiave', value: keyPermissions.length > 1024 ? 'Troppi permessi per visualizzarli' : keyPermissions, inline: false }
            )
            .setTimestamp()
            .setFooter({ text: `Richiesto da ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });
        
        await interaction.reply({ embeds: [embed] });
    }
};
