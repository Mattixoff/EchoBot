const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const config = require('../../config.js');

module.exports = {
    name: 'dbstats',
    description: 'Shows MongoDB database statistics',
    category: 'Utility',
    cooldown: 30,
    enabled: true,
    permissions: [PermissionsBitField.Flags.Administrator],
    
    data: new SlashCommandBuilder()
        .setName('dbstats')
        .setDescription('Shows MongoDB database statistics'),
    
    async execute(interaction) {
        try {
            const database = interaction.client.database;
            
            if (!database.isConnected) {
                return interaction.reply({ 
                    content: '`❌` **Database not connected.**',
                    ephemeral: true 
                });
            }

            // Test connection
            const pingResult = await database.ping();
            if (!pingResult) {
                return interaction.reply({ 
                    content: '`❌` **Database connection error.**',
                    ephemeral: true 
                });
            }

            // Get statistics
            const stats = await database.getStats();
            const connectionStatus = database.getConnectionStatus();

            const embed = new EmbedBuilder()
                .setColor(config.embed.colors.info)
                .setTitle('🗄️ MongoDB Database Statistics')
                .setDescription('Detailed information about the bot database')
                .addFields(
                    { 
                        name: '🔌 Connection Status', 
                        value: database.isConnected ? '✅ Connected' : '❌ Disconnected', 
                        inline: true 
                    },
                    { 
                        name: '🏓 Ping', 
                        value: pingResult ? '✅ OK' : '❌ Failed', 
                        inline: true 
                    },
                    { 
                        name: '📊 Database', 
                        value: connectionStatus.database || 'N/A', 
                        inline: true 
                    },
                    { name: '📋 Separator', value: '─'.repeat(20), inline: false },
                    { 
                        name: '👥 Users', 
                        value: stats.users?.toLocaleString() || '0', 
                        inline: true 
                    },
                    { 
                        name: '🏠 Servers', 
                        value: stats.guilds?.toLocaleString() || '0', 
                        inline: true 
                    },
                    { 
                        name: '⚠️ Warnings', 
                        value: stats.warnings?.toLocaleString() || '0', 
                        inline: true 
                    },
                    { 
                        name: '📈 Levels', 
                        value: stats.levels?.toLocaleString() || '0', 
                        inline: true 
                    },
                    { 
                        name: '📝 Logs', 
                        value: stats.logs?.toLocaleString() || '0', 
                        inline: true 
                    },
                    { 
                        name: '⚡ Commands', 
                        value: stats.commands?.toLocaleString() || '0', 
                        inline: true 
                    }
                )
                .setTimestamp()
                .setFooter({ 
                    text: `Requested by ${interaction.user.tag}`, 
                    iconURL: interaction.user.displayAvatarURL() 
                });

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            logger.error(`Error in dbstats command: ${error.message}`);
            await interaction.reply({ 
                content: '`❌` **Error retrieving database statistics.**',
                ephemeral: true 
            });
        }
    }
};
