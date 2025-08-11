const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const logger = require('../../utils/logger.js');
const config = require('../../config.js');
const fs = require('fs').promises;
const path = require('path');

module.exports = {
    name: 'interactionCreate',
    category: 'Generale',
    enabled: true,
    once: false,
    
    async execute(interaction) {
        // Gestisce le interazioni con pulsanti
        if (interaction.isButton()) {
            await handleButtonInteraction(interaction);
        }
        
        // Gestisce le interazioni con menu a tendina
        if (interaction.isStringSelectMenu()) {
            await handleSelectMenuInteraction(interaction);
        }
        
        // Gestisce le interazioni con modal
        if (interaction.isModalSubmit()) {
            await handleModalSubmit(interaction);
        }
    }
};

async function handleButtonInteraction(interaction) {
    // Gestisce il pulsante di verifica
    if (interaction.customId === 'verify_user') {
        try {
            // Carica la configurazione dal database
            const database = interaction.client.database;
            const guildId = interaction.guild.id;
            const verificationConfig = await database.getVerificationConfig(guildId);
            
            if (!verificationConfig || !verificationConfig.enabled) {
                return interaction.reply({ 
                    content: '`❌` **Sistema di verifica disabilitato.**', 
                    ephemeral: true 
                });
            }
            
            // Controlla se è specificato un ruolo di verifica
            if (!verificationConfig.verifiedRole) {
                return interaction.reply({ 
                    content: '`❌` **Ruolo di verifica non configurato.**', 
                    ephemeral: true 
                });
            }
            
            const member = interaction.member;
            const verifiedRole = interaction.guild.roles.cache.get(verificationConfig.verifiedRole);
            
            if (!verifiedRole) {
                return interaction.reply({ 
                    content: '`❌` **Ruolo di verifica non trovato nel server.**', 
                    ephemeral: true 
                });
            }
            
            // Controlla se l'utente è già verificato
            if (member.roles.cache.has(verifiedRole.id)) {
                return interaction.reply({ 
                    content: '`✅` **Sei già verificato!**', 
                    ephemeral: true 
                });
            }
            
            // Assegna il ruolo di verifica
            await member.roles.add(verifiedRole);
            
            // Invia messaggio di conferma
            await interaction.reply({ 
                content: verificationConfig.successMessage || '`✅` **Verifica completata con successo!**', 
                ephemeral: true 
            });
            
            logger.info(`✅ Utente ${member.user.tag} verificato nel server ${interaction.guild.name}`);
            
            // Invia messaggio nel canale di log se configurato
            if (verificationConfig.logChannel) {
                const logChannel = interaction.guild.channels.cache.get(verificationConfig.logChannel);
                if (logChannel) {
                    await logChannel.send({
                        content: `✅ **${member.user.tag}** si è verificato con successo!`
                    });
                }
            }
            
        } catch (error) {
            logger.error(`Errore nella verifica dell'utente: ${error.message}`);
            await interaction.reply({ 
                content: '`❌` **Errore durante la verifica. Contatta un amministratore.**', 
                ephemeral: true 
            });
        }
    }
    
    // Gestisce i pulsanti del setup di verifica
    if (interaction.customId.startsWith('setup_') || interaction.customId === 'test_verification') {
        try {
            // Controlla i permessi amministratore
            if (!interaction.member.permissions.has('Administrator')) {
                return interaction.reply({
                    content: '`❌` **Non hai i permessi per configurare il sistema.**',
                    ephemeral: true
                });
            }

            switch (interaction.customId) {
                case 'setup_enable_verification':
                    await handleEnableVerification(interaction);
                    break;
                case 'setup_verified_role':
                    await handleSetVerifiedRole(interaction);
                    break;
                case 'setup_log_channel':
                    await handleSetLogChannel(interaction);
                    break;
                case 'setup_button_customize':
                    await handleCustomizeButton(interaction);
                    break;
                case 'setup_verification_channel':
                    await handleSetVerificationChannel(interaction);
                    break;
                case 'send_verification_embed':
                    await handleSendVerificationEmbed(interaction);
                    break;
                case 'test_verification':
                    await handleTestVerification(interaction);
                    break;
                default:
                    logger.warn(`Pulsante non riconosciuto: ${interaction.customId}`);
                    break;
            }
        } catch (error) {
            logger.error(`Errore nella gestione del setup: ${error.message}`);
            await interaction.reply({
                content: '`❌` **Errore durante la configurazione.**',
                ephemeral: true
            });
        }
    }
}

async function handleSelectMenuInteraction(interaction) {
    // Gestisce il menu del setup di verifica
    if (interaction.customId === 'setup_verification_menu') {
        try {
            // Controlla i permessi amministratore
            if (!interaction.member.permissions.has('Administrator')) {
                return interaction.reply({
                    content: '`❌` **Non hai i permessi per configurare il sistema.**',
                    ephemeral: true
                });
            }

            const selectedValue = interaction.values[0];

            switch (selectedValue) {
                case 'toggle_system':
                    await handleEnableVerification(interaction);
                    break;
                case 'set_verified_role':
                    await handleSetVerifiedRole(interaction);
                    break;
                case 'set_verification_channel':
                    await handleSetVerificationChannel(interaction);
                    break;
                case 'set_log_channel':
                    await handleSetLogChannel(interaction);
                    break;
                case 'customize_button':
                    await handleCustomizeButton(interaction);
                    break;
                case 'customize_colors':
                    await handleCustomizeColors(interaction);
                    break;
                case 'customize_embed':
                    await handleCustomizeEmbed(interaction);
                    break;
                case 'send_verification_embed':
                    await handleSendVerificationEmbed(interaction);
                    break;
                case 'test_verification':
                    await handleTestVerification(interaction);
                    break;
                default:
                    logger.warn(`Opzione menu non riconosciuta: ${selectedValue}`);
                    await interaction.reply({
                        content: '`❌` **Opzione non riconosciuta.**',
                        ephemeral: true
                    });
                    break;
            }
        } catch (error) {
            logger.error(`Errore nella gestione del menu: ${error.message}`);
            await interaction.reply({
                content: '`❌` **Errore durante la configurazione.**',
                ephemeral: true
            });
        }
    }
}

async function handleModalSubmit(interaction) {
    try {
        switch (interaction.customId) {
            case 'modal_verified_role':
                await handleVerifiedRoleModal(interaction);
                break;
            case 'modal_log_channel':
                await handleLogChannelModal(interaction);
                break;
            case 'modal_button_customize':
                await handleButtonCustomizeModal(interaction);
                break;
            case 'modal_verification_channel':
                await handleVerificationChannelModal(interaction);
                break;
            case 'modal_customize_colors':
                await handleCustomizeColorsModal(interaction);
                break;
            case 'modal_customize_embed':
                await handleCustomizeEmbedModal(interaction);
                break;
        }
    } catch (error) {
        logger.error(`Errore nella gestione del modal: ${error.message}`);
        await interaction.reply({
            content: '`❌` **Errore durante la configurazione.**',
            ephemeral: true
        });
    }
}

// Funzioni helper per il setup
async function handleEnableVerification(interaction) {
    const database = interaction.client.database;
    const guildId = interaction.guild.id;
    const verificationConfig = await database.getVerificationConfig(guildId);
    
    const currentStatus = verificationConfig.enabled;
    const newStatus = !currentStatus;
    
    // Aggiorna nel database
    await database.updateVerificationConfig(guildId, { enabled: newStatus });
    
    // Aggiorna l'embed in tempo reale
    await updateSetupEmbed(interaction, guildId);
    
    await interaction.reply({
        content: `\`${currentStatus ? '❌' : '✅'}\` **Sistema di verifica ${currentStatus ? 'disabilitato' : 'abilitato'} con successo!**`,
        ephemeral: true
    });
}

async function handleSetVerifiedRole(interaction) {
    const database = interaction.client.database;
    const guildId = interaction.guild.id;
    const verificationConfig = await database.getVerificationConfig(guildId);

    const modal = new ModalBuilder()
        .setCustomId('modal_verified_role')
        .setTitle('Imposta Ruolo Verificato');

    const roleInput = new TextInputBuilder()
        .setCustomId('verified_role_input')
        .setLabel('ID del ruolo da assegnare')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Es: 1234567890123456789')
        .setValue(verificationConfig.verifiedRole || '')
        .setRequired(true);

    const firstActionRow = new ActionRowBuilder().addComponents(roleInput);
    modal.addComponents(firstActionRow);

    await interaction.showModal(modal);
}

async function handleSetLogChannel(interaction) {
    const database = interaction.client.database;
    const guildId = interaction.guild.id;
    const verificationConfig = await database.getVerificationConfig(guildId);

    const modal = new ModalBuilder()
        .setCustomId('modal_log_channel')
        .setTitle('Imposta Canale Log');

    const channelInput = new TextInputBuilder()
        .setCustomId('log_channel_input')
        .setLabel('ID del canale per i log')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Es: 1234567890123456789')
        .setValue(verificationConfig.logChannel || '')
        .setRequired(false);

    const firstActionRow = new ActionRowBuilder().addComponents(channelInput);
    modal.addComponents(firstActionRow);

    await interaction.showModal(modal);
}

async function handleCustomizeButton(interaction) {
    const database = interaction.client.database;
    const guildId = interaction.guild.id;
    const verificationConfig = await database.getVerificationConfig(guildId);

    const modal = new ModalBuilder()
        .setCustomId('modal_button_customize')
        .setTitle('Personalizza Pulsante di Verifica');

    const textInput = new TextInputBuilder()
        .setCustomId('button_text_input')
        .setLabel('Testo del pulsante')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Es: Verifica')
        .setValue(verificationConfig.buttonText || 'Verifica')
        .setRequired(true);

    const emojiInput = new TextInputBuilder()
        .setCustomId('button_emoji_input')
        .setLabel('Emoji del pulsante')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Es: ✅')
        .setValue(verificationConfig.buttonEmoji || '✅')
        .setRequired(false);

    const firstActionRow = new ActionRowBuilder().addComponents(textInput);
    const secondActionRow = new ActionRowBuilder().addComponents(emojiInput);
    modal.addComponents(firstActionRow, secondActionRow);

    await interaction.showModal(modal);
}

async function handleCustomizeColors(interaction) {
    const database = interaction.client.database;
    const guildId = interaction.guild.id;
    const verificationConfig = await database.getVerificationConfig(guildId);

    const modal = new ModalBuilder()
        .setCustomId('modal_customize_colors')
        .setTitle('Personalizza Colori');

    const buttonColorInput = new TextInputBuilder()
        .setCustomId('button_color_input')
        .setLabel('Colore del pulsante')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Success, Primary, Secondary, Danger')
        .setValue(verificationConfig.buttonColor || 'Success')
        .setRequired(true);

    const embedColorInput = new TextInputBuilder()
        .setCustomId('embed_color_input')
        .setLabel('Colore dell\'embed (esadecimale)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Es: #0099ff')
        .setValue(verificationConfig.embedColor || '#0099ff')
        .setRequired(true);

    const firstActionRow = new ActionRowBuilder().addComponents(buttonColorInput);
    const secondActionRow = new ActionRowBuilder().addComponents(embedColorInput);
    modal.addComponents(firstActionRow, secondActionRow);

    await interaction.showModal(modal);
}

async function handleCustomizeEmbed(interaction) {
    const database = interaction.client.database;
    const guildId = interaction.guild.id;
    const verificationConfig = await database.getVerificationConfig(guildId);

    const modal = new ModalBuilder()
        .setCustomId('modal_customize_embed')
        .setTitle('Personalizza Embed di Verifica');

    const titleInput = new TextInputBuilder()
        .setCustomId('embed_title_input')
        .setLabel('Titolo dell\'embed')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Es: 🔐 **Verifica del Server**')
        .setValue(verificationConfig.embed?.title || '🔐 **Verifica del Server**')
        .setRequired(true);

    const descriptionInput = new TextInputBuilder()
        .setCustomId('embed_description_input')
        .setLabel('Descrizione dell\'embed')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Inserisci la descrizione dell\'embed...')
        .setValue(verificationConfig.embed?.description || 'Benvenuto nel server! Per accedere ai canali, devi prima verificarti.\n\n**Clicca il pulsante qui sotto per verificarti e ricevere i permessi necessari.**')
        .setRequired(true);

    const thumbnailInput = new TextInputBuilder()
        .setCustomId('embed_thumbnail_input')
        .setLabel('URL Thumbnail (opzionale)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Es: https://example.com/image.png')
        .setValue(verificationConfig.embed?.thumbnail || '')
        .setRequired(false);

    const footerTextInput = new TextInputBuilder()
        .setCustomId('embed_footer_text_input')
        .setLabel('Testo Footer')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Es: EchoBot Discord - Sistema di Verifica')
        .setValue(verificationConfig.embed?.footer?.text || 'EchoBot Discord - Sistema di Verifica')
        .setRequired(false);

    const footerIconInput = new TextInputBuilder()
        .setCustomId('embed_footer_icon_input')
        .setLabel('URL Icona Footer (opzionale)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Es: https://example.com/icon.png')
        .setValue(verificationConfig.embed?.footer?.iconURL || '')
        .setRequired(false);

    const firstActionRow = new ActionRowBuilder().addComponents(titleInput);
    const secondActionRow = new ActionRowBuilder().addComponents(descriptionInput);
    const thirdActionRow = new ActionRowBuilder().addComponents(thumbnailInput);
    const fourthActionRow = new ActionRowBuilder().addComponents(footerTextInput);
    const fifthActionRow = new ActionRowBuilder().addComponents(footerIconInput);
    
    modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow, fifthActionRow);

    await interaction.showModal(modal);
}

async function handleSetVerificationChannel(interaction) {
    const database = interaction.client.database;
    const guildId = interaction.guild.id;
    const verificationConfig = await database.getVerificationConfig(guildId);

    const modal = new ModalBuilder()
        .setCustomId('modal_verification_channel')
        .setTitle('Imposta Canale Verifica');

    const channelInput = new TextInputBuilder()
        .setCustomId('verification_channel_input')
        .setLabel('ID del canale per l\'embed di verifica')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Es: 1234567890123456789')
        .setValue(verificationConfig.verificationChannel || '')
        .setRequired(true);

    const firstActionRow = new ActionRowBuilder().addComponents(channelInput);
    modal.addComponents(firstActionRow);

    await interaction.showModal(modal);
}

async function handleSendVerificationEmbed(interaction) {
    const database = interaction.client.database;
    const guildId = interaction.guild.id;
    const verificationConfig = await database.getVerificationConfig(guildId);

    if (!verificationConfig.verificationChannel) {
        return interaction.reply({
            content: '`❌` **Canale di verifica non configurato. Configura prima il canale.**',
            ephemeral: true
        });
    }

    const verificationChannel = interaction.guild.channels.cache.get(verificationConfig.verificationChannel);
    if (!verificationChannel) {
        return interaction.reply({
            content: '`❌` **Canale di verifica non trovato nel server.**',
            ephemeral: true
        });
    }

    try {
        const verificationEmbed = new EmbedBuilder()
            .setColor(verificationConfig.embedColor || config.embed.colors.primary)
            .setTitle(verificationConfig.embed?.title || '🔐 **Verifica del Server**')
            .setDescription(verificationConfig.embed?.description || 'Benvenuto nel server! Per accedere ai canali, devi prima verificarti.\n\n**Clicca il pulsante qui sotto per verificarti e ricevere i permessi necessari.**');
        
        // Aggiungi thumbnail se configurato
        if (verificationConfig.embed?.thumbnail) {
            verificationEmbed.setThumbnail(verificationConfig.embed.thumbnail);
        }
        
        // Aggiungi footer se configurato
        if (verificationConfig.embed?.footer) {
            const footerOptions = {};
            if (verificationConfig.embed.footer.text) {
                footerOptions.text = verificationConfig.embed.footer.text;
            }
            if (verificationConfig.embed.footer.iconURL) {
                footerOptions.iconURL = verificationConfig.embed.footer.iconURL;
            }
            verificationEmbed.setFooter(footerOptions);
        }
        
        // Aggiungi timestamp se configurato
        if (verificationConfig.embed?.timestamp !== false) {
            verificationEmbed.setTimestamp();
        }

        // Determina il colore del pulsante
        let buttonStyle;
        switch (verificationConfig.buttonColor || 'Success') {
            case 'Primary':
                buttonStyle = ButtonStyle.Primary;
                break;
            case 'Secondary':
                buttonStyle = ButtonStyle.Secondary;
                break;
            case 'Danger':
                buttonStyle = ButtonStyle.Danger;
                break;
            case 'Success':
            default:
                buttonStyle = ButtonStyle.Success;
                break;
        }

        const verifyButton = new ButtonBuilder()
            .setCustomId('verify_user')
            .setLabel(verificationConfig.buttonText || 'Verifica')
            .setStyle(buttonStyle)
            .setEmoji(verificationConfig.buttonEmoji || '✅');

        const row = new ActionRowBuilder().addComponents(verifyButton);

        await verificationChannel.send({
            embeds: [verificationEmbed],
            components: [row]
        });

        await interaction.reply({
            content: `\`✅\` **Embed di verifica inviato con successo in ${verificationChannel}!**`,
            ephemeral: true
        });

    } catch (error) {
        logger.error(`Errore nell'invio dell'embed di verifica: ${error.message}`);
        await interaction.reply({
            content: '`❌` **Errore nell\'invio dell\'embed di verifica.**',
            ephemeral: true
        });
    }
}

async function handleTestVerification(interaction) {
    const database = interaction.client.database;
    const guildId = interaction.guild.id;
    const verificationConfig = await database.getVerificationConfig(guildId);

    if (!verificationConfig || !verificationConfig.enabled) {
        return interaction.reply({
            content: '`❌` **Il sistema di verifica non è abilitato.**',
            ephemeral: true
        });
    }

    if (!verificationConfig.verifiedRole) {
        return interaction.reply({
            content: '`❌` **Ruolo di verifica non configurato.**',
            ephemeral: true
        });
    }

    const verifiedRole = interaction.guild.roles.cache.get(verificationConfig.verifiedRole);
    if (!verifiedRole) {
        return interaction.reply({
            content: '`❌` **Ruolo di verifica non trovato nel server.**',
            ephemeral: true
        });
    }

    // Simula la verifica
    await interaction.reply({
        content: `\`✅\` **Test completato!** Il sistema funziona correttamente.\n\n**Ruolo:** ${verifiedRole}\n**Testo pulsante:** ${verificationConfig.buttonText}\n**Emoji pulsante:** ${verificationConfig.buttonEmoji}`,
        ephemeral: true
    });
}

async function updateSetupEmbed(interaction, guildId) {
    try {
        const database = interaction.client.database;
        const verificationConfig = await database.getVerificationConfig(guildId);
        const config = require('../../config.js');

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

        await interaction.message.edit({
            embeds: [setupEmbed],
            components: [setupMenu]
        });
    } catch (error) {
        logger.error(`Errore nell'aggiornamento dell'embed: ${error.message}`);
    }
}

// Funzioni per gestire i modal submit
async function handleVerifiedRoleModal(interaction) {
    const roleId = interaction.fields.getTextInputValue('verified_role_input');
    const database = interaction.client.database;
    const guildId = interaction.guild.id;
    
    // Verifica che il ruolo esista
    const role = interaction.guild.roles.cache.get(roleId);
    if (!role) {
        return interaction.reply({
            content: '`❌` **Ruolo non trovato nel server. Verifica l\'ID del ruolo.**',
            ephemeral: true
        });
    }
    
    // Aggiorna nel database
    await database.updateVerificationConfig(guildId, { verifiedRole: roleId });
    
    // Aggiorna l'embed in tempo reale
    await updateSetupEmbed(interaction, guildId);
    
    await interaction.reply({
        content: `\`✅\` **Ruolo di verifica impostato:** ${role}`,
        ephemeral: true
    });
}

async function handleLogChannelModal(interaction) {
    const channelId = interaction.fields.getTextInputValue('log_channel_input');
    const database = interaction.client.database;
    const guildId = interaction.guild.id;
    
    if (channelId) {
        // Verifica che il canale esista
        const channel = interaction.guild.channels.cache.get(channelId);
        if (!channel) {
            return interaction.reply({
                content: '`❌` **Canale non trovato nel server. Verifica l\'ID del canale.**',
                ephemeral: true
            });
        }
    }
    
    // Aggiorna nel database
    await database.updateVerificationConfig(guildId, { logChannel: channelId || null });
    
    // Aggiorna l'embed in tempo reale
    await updateSetupEmbed(interaction, guildId);
    
    await interaction.reply({
        content: `\`✅\` **Canale di log ${channelId ? 'impostato' : 'rimosso'} con successo!**`,
        ephemeral: true
    });
}

async function handleButtonCustomizeModal(interaction) {
    const buttonText = interaction.fields.getTextInputValue('button_text_input');
    const buttonEmoji = interaction.fields.getTextInputValue('button_emoji_input');
    const database = interaction.client.database;
    const guildId = interaction.guild.id;
    
    // Aggiorna nel database
    await database.updateVerificationConfig(guildId, { 
        buttonText: buttonText,
        buttonEmoji: buttonEmoji
    });
    
    // Aggiorna l'embed in tempo reale
    await updateSetupEmbed(interaction, guildId);
    
    await interaction.reply({
        content: `\`✅\` **Pulsante personalizzato con successo!**\n\n**Testo:** ${buttonText}\n**Emoji:** ${buttonEmoji}`,
        ephemeral: true
    });
}

async function handleVerificationChannelModal(interaction) {
    const channelId = interaction.fields.getTextInputValue('verification_channel_input');
    const database = interaction.client.database;
    const guildId = interaction.guild.id;
    
    // Verifica che il canale esista
    const channel = interaction.guild.channels.cache.get(channelId);
    if (!channel) {
        return interaction.reply({
            content: '`❌` **Canale non trovato nel server. Verifica l\'ID del canale.**',
            ephemeral: true
        });
    }
    
    // Aggiorna nel database
    await database.updateVerificationConfig(guildId, { verificationChannel: channelId });
    
    // Aggiorna l'embed in tempo reale
    await updateSetupEmbed(interaction, guildId);
    
    await interaction.reply({
        content: `\`✅\` **Canale di verifica impostato:** ${channel}`,
        ephemeral: true
    });
}

async function handleCustomizeColorsModal(interaction) {
    const buttonColor = interaction.fields.getTextInputValue('button_color_input');
    const embedColor = interaction.fields.getTextInputValue('embed_color_input');
    const database = interaction.client.database;
    const guildId = interaction.guild.id;
    
    // Valida il colore del pulsante
    const validButtonColors = ['Success', 'Primary', 'Secondary', 'Danger'];
    if (!validButtonColors.includes(buttonColor)) {
        return interaction.reply({
            content: '`❌` **Colore del pulsante non valido. Usa: Success, Primary, Secondary, Danger**',
            ephemeral: true
        });
    }
    
    // Valida il colore dell'embed (formato esadecimale)
    const hexColorRegex = /^#[0-9A-F]{6}$/i;
    if (!hexColorRegex.test(embedColor)) {
        return interaction.reply({
            content: '`❌` **Colore dell\'embed non valido. Usa formato esadecimale (es: #0099ff)**',
            ephemeral: true
        });
    }
    
    // Aggiorna nel database
    await database.updateVerificationConfig(guildId, { 
        buttonColor: buttonColor,
        embedColor: embedColor
    });
    
    // Aggiorna l'embed in tempo reale
    await updateSetupEmbed(interaction, guildId);
    
    await interaction.reply({
        content: `\`✅\` **Colori personalizzati con successo!**\n\n**Colore pulsante:** ${buttonColor}\n**Colore embed:** ${embedColor}`,
        ephemeral: true
    });
}

async function handleCustomizeEmbedModal(interaction) {
    const title = interaction.fields.getTextInputValue('embed_title_input');
    const description = interaction.fields.getTextInputValue('embed_description_input');
    const thumbnail = interaction.fields.getTextInputValue('embed_thumbnail_input');
    const footerText = interaction.fields.getTextInputValue('embed_footer_text_input');
    const footerIcon = interaction.fields.getTextInputValue('embed_footer_icon_input');
    const database = interaction.client.database;
    const guildId = interaction.guild.id;
    
    // Valida l'URL del thumbnail se fornito
    if (thumbnail && !isValidUrl(thumbnail)) {
        return interaction.reply({
            content: '`❌` **URL del thumbnail non valido.**',
            ephemeral: true
        });
    }
    
    // Valida l'URL dell'icona footer se fornito
    if (footerIcon && !isValidUrl(footerIcon)) {
        return interaction.reply({
            content: '`❌` **URL dell\'icona footer non valido.**',
            ephemeral: true
        });
    }
    
    // Prepara l'oggetto embed
    const embedConfig = {
        title: title,
        description: description,
        thumbnail: thumbnail || null,
        footer: {
            text: footerText || 'EchoBot Discord - Sistema di Verifica',
            iconURL: footerIcon || null
        },
        timestamp: true
    };
    
    // Aggiorna nel database
    await database.updateVerificationConfig(guildId, { 
        embed: embedConfig
    });
    
    // Aggiorna l'embed in tempo reale
    await updateSetupEmbed(interaction, guildId);
    
    await interaction.reply({
        content: `\`✅\` **Embed personalizzato con successo!**\n\n**Titolo:** ${title}\n**Descrizione:** ${description.substring(0, 50)}...`,
        ephemeral: true
    });
}

// Funzione helper per validare URL
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}
