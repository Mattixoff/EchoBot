const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, PermissionFlagsBits } = require('discord.js');
const logger = require('../../utils/logger.js');
const config = require('../../config.js');

module.exports = {
    name: 'setup-verify',
    description: 'Configura il sistema di verifica per il server',
    category: 'Amministrazione',
    enabled: true,
    
    data: new SlashCommandBuilder()
        .setName('setup-verify')
        .setDescription('Configura il sistema di verifica per il server')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction) {
        try {
            // Controlla i permessi
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({
                    content: '`❌` **Non hai i permessi per utilizzare questo comando.**',
                    ephemeral: true
                });
            }

            // Carica la configurazione dal database
            const database = interaction.client.database;
            const guildId = interaction.guild.id;
            let verificationConfig = await database.getVerificationConfig(guildId);
            
            // Se non esiste nel database, usa la configurazione di default
            if (!verificationConfig) {
                verificationConfig = {
                    enabled: false,
                    verifiedRole: null,
                    buttonText: 'Verifica',
                    buttonEmoji: '✅',
                    successMessage: '`✅` **Verifica completata con successo!**',
                    logChannel: null
                };
                // Salva la configurazione di default nel database
                await database.saveVerificationConfig(guildId, verificationConfig);
            }

            const setupEmbed = new EmbedBuilder()
                .setColor(config.embed.colors.primary)
                .setTitle('🔧 **Setup Sistema di Verifica**')
                .setDescription('Configura il sistema di verifica per il tuo server.\n\n**Come funziona:**\n1. I nuovi membri ricevono un messaggio di benvenuto con un pulsante di verifica\n2. Quando cliccano il pulsante, ricevono automaticamente il ruolo verificato\n3. Il sistema è completamente personalizzabile\n\n**Configurazione attuale:**')
                .addFields(
                    { 
                        name: '📋 Stato Sistema', 
                        value: verificationConfig.enabled ? '`✅` Abilitato' : '`❌` Disabilitato', 
                        inline: true 
                    },
                    { 
                        name: '🎭 Ruolo Verificato', 
                        value: verificationConfig.verifiedRole ? `<@&${verificationConfig.verifiedRole}>` : '`❌` Non configurato', 
                        inline: true 
                    },
                    { 
                        name: '📢 Canale Verifica', 
                        value: verificationConfig.verificationChannel ? `<#${verificationConfig.verificationChannel}>` : '`❌` Non configurato', 
                        inline: true 
                    },
                    { 
                        name: '📝 Canale Log', 
                        value: verificationConfig.logChannel ? `<#${verificationConfig.logChannel}>` : '`❌` Non configurato', 
                        inline: true 
                    },
                    { 
                        name: '🔘 Testo Pulsante', 
                        value: verificationConfig.buttonText || 'Verifica', 
                        inline: true 
                    },
                    { 
                        name: '😀 Emoji Pulsante', 
                        value: verificationConfig.buttonEmoji || '✅', 
                        inline: true 
                    },
                    { 
                        name: '🎨 Colore Pulsante', 
                        value: verificationConfig.buttonColor || 'Success', 
                        inline: true 
                    },
                    { 
                        name: '🌈 Colore Embed', 
                        value: verificationConfig.embedColor || '#0099ff', 
                        inline: true 
                    },
                    { 
                        name: '📝 Titolo Embed', 
                        value: verificationConfig.embed?.title || '🔐 **Verifica del Server**', 
                        inline: false 
                    },
                    { 
                        name: '📄 Descrizione Embed', 
                        value: verificationConfig.embed?.description?.substring(0, 50) + '...' || 'Benvenuto nel server! Per accedere ai canali...', 
                        inline: false 
                    }
                )
                .setFooter({ text: 'Clicca i pulsanti qui sotto per configurare il sistema' })
                .setTimestamp();

            const setupMenu = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('setup_verification_menu')
                        .setPlaceholder('Seleziona un\'azione per configurare il sistema...')
                        .addOptions(
                            new StringSelectMenuOptionBuilder()
                                .setLabel(verificationConfig.enabled ? 'Disabilita Sistema' : 'Abilita Sistema')
                                .setDescription(verificationConfig.enabled ? 'Disabilita il sistema di verifica' : 'Abilita il sistema di verifica')
                                .setValue('toggle_system')
                                .setEmoji(verificationConfig.enabled ? '❌' : '✅'),
                            
                            new StringSelectMenuOptionBuilder()
                                .setLabel('Imposta Ruolo Verificato')
                                .setDescription('Configura il ruolo da assegnare dopo la verifica')
                                .setValue('set_verified_role')
                                .setEmoji('🎭'),
                            
                            new StringSelectMenuOptionBuilder()
                                .setLabel('Imposta Canale Verifica')
                                .setDescription('Configura il canale dove inviare l\'embed di verifica')
                                .setValue('set_verification_channel')
                                .setEmoji('📢'),
                            
                            new StringSelectMenuOptionBuilder()
                                .setLabel('Imposta Canale Log')
                                .setDescription('Configura il canale per i log di verifica')
                                .setValue('set_log_channel')
                                .setEmoji('📝'),
                            
                            new StringSelectMenuOptionBuilder()
                                .setLabel('Personalizza Pulsante')
                                .setDescription('Personalizza testo ed emoji del pulsante di verifica')
                                .setValue('customize_button')
                                .setEmoji('🔧'),
                            
                            new StringSelectMenuOptionBuilder()
                                .setLabel('Personalizza Colori')
                                .setDescription('Personalizza colore del pulsante e dell\'embed')
                                .setValue('customize_colors')
                                .setEmoji('🎨'),
                            
                            new StringSelectMenuOptionBuilder()
                                .setLabel('Personalizza Embed')
                                .setDescription('Personalizza titolo, descrizione e altri elementi dell\'embed')
                                .setValue('customize_embed')
                                .setEmoji('📝'),
                            
                            new StringSelectMenuOptionBuilder()
                                .setLabel('Invia Embed di Verifica')
                                .setDescription('Invia l\'embed di verifica nel canale configurato')
                                .setValue('send_verification_embed')
                                .setEmoji('📤'),
                            
                            new StringSelectMenuOptionBuilder()
                                .setLabel('Test Sistema')
                                .setDescription('Testa la configurazione del sistema di verifica')
                                .setValue('test_verification')
                                .setEmoji('🧪')
                        )
                );

            await interaction.reply({
                embeds: [setupEmbed],
                components: [setupMenu],
                ephemeral: true
            });

        } catch (error) {
            logger.error(`Errore nel comando setup-verify: ${error.message}`);
            await interaction.reply({
                content: '`❌` **Errore durante la configurazione del sistema di verifica.**',
                ephemeral: true
            });
        }
    }
};
