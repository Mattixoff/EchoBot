const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const config = require('../../config.js');

module.exports = {
    name: 'dbstats',
    description: 'Mostra le statistiche del database MongoDB',
    category: 'Utilità',
    cooldown: 30,
    enabled: true,
    permissions: [PermissionsBitField.Flags.Administrator],
    
    data: new SlashCommandBuilder()
        .setName('dbstats')
        .setDescription('Mostra le statistiche del database MongoDB'),
    
    async execute(interaction) {
        try {
            const database = interaction.client.database;
            
            if (!database.isConnected) {
                return interaction.reply({ 
                    content: '`❌` **Database non connesso.**',
                    ephemeral: true 
                });
            }

            // Test della connessione
            const pingResult = await database.ping();
            if (!pingResult) {
                return interaction.reply({ 
                    content: '`❌` **Errore nella connessione al database.**',
                    ephemeral: true 
                });
            }

            // Ottieni le statistiche
            const stats = await database.getStats();
            const connectionStatus = database.getConnectionStatus();

            const embed = new EmbedBuilder()
                .setColor(config.embed.colors.info)
                .setTitle('🗄️ Statistiche Database MongoDB')
                .setDescription('Informazioni dettagliate sul database del bot')
                .addFields(
                    { 
                        name: '🔌 Stato Connessione', 
                        value: database.isConnected ? '✅ Connesso' : '❌ Disconnesso', 
                        inline: true 
                    },
                    { 
                        name: '🏓 Ping', 
                        value: pingResult ? '✅ OK' : '❌ Fallito', 
                        inline: true 
                    },
                    { 
                        name: '📊 Database', 
                        value: connectionStatus.database || 'N/A', 
                        inline: true 
                    },
                    { name: '📋 Separatore', value: '─'.repeat(20), inline: false },
                    { 
                        name: '👥 Utenti', 
                        value: stats.users?.toLocaleString() || '0', 
                        inline: true 
                    },
                    { 
                        name: '🏠 Server', 
                        value: stats.guilds?.toLocaleString() || '0', 
                        inline: true 
                    },
                    { 
                        name: '⚠️ Warning', 
                        value: stats.warnings?.toLocaleString() || '0', 
                        inline: true 
                    },
                    { 
                        name: '📈 Livelli', 
                        value: stats.levels?.toLocaleString() || '0', 
                        inline: true 
                    },
                    { 
                        name: '📝 Log', 
                        value: stats.logs?.toLocaleString() || '0', 
                        inline: true 
                    },
                    { 
                        name: '⚡ Comandi', 
                        value: stats.commands?.toLocaleString() || '0', 
                        inline: true 
                    }
                )
                .setTimestamp()
                .setFooter({ 
                    text: `Richiesto da ${interaction.user.tag}`, 
                    iconURL: interaction.user.displayAvatarURL() 
                });

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            logger.error(`Errore nel comando dbstats: ${error.message}`);
            await interaction.reply({ 
                content: '`❌` **Errore nel recupero delle statistiche del database.**',
                ephemeral: true 
            });
        }
    }
};
