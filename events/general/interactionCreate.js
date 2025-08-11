const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const logger = require('../../utils/logger.js');
const config = require('../../config.js');
const fs = require('fs').promises;
const path = require('path');

module.exports = {
    name: 'interactionCreate',
    category: 'General',
    enabled: true,
    once: false,
    
    async execute(interaction) {
        // Handle button interactions
        if (interaction.isButton()) {
            await handleButtonInteraction(interaction);
        }
        
        // Handle select menu interactions
        if (interaction.isStringSelectMenu()) {
            await handleSelectMenuInteraction(interaction);
        }
        
        // Handle modal interactions
        if (interaction.isModalSubmit()) {
            await handleModalSubmit(interaction);
        }
    }
};

async function handleButtonInteraction(interaction) {
    // Handle verification button
    if (interaction.customId === 'verify_user') {
        try {
            // Load configuration from database
            const database = interaction.client.database;
            const guildId = interaction.guild.id;
            const verificationConfig = await database.getVerificationConfig(guildId);
            
            if (!verificationConfig || !verificationConfig.enabled) {
                return interaction.reply({ 
                    content: '`❌` **Verification system disabled.**', 
                    ephemeral: true 
                });
            }
            
            // Check if verification role is specified
            if (!verificationConfig.verifiedRole) {
                return interaction.reply({ 
                    content: '`❌` **Verification role not configured.**', 
                    ephemeral: true 
                });
            }
        
            const member = interaction.member;
            const verifiedRole = interaction.guild.roles.cache.get(verificationConfig.verifiedRole);
            
            if (!verifiedRole) {
                return interaction.reply({ 
                    content: '`❌` **Verification role not found in server.**', 
                    ephemeral: true 
                });
            }
            
            // Check if user is already verified
            if (member.roles.cache.has(verifiedRole.id)) {
                return interaction.reply({ 
                    content: '`✅` **You are already verified!**', 
                    ephemeral: true 
                });
            }
            
            // Assign verification role
            await member.roles.add(verifiedRole);
            
            // Send confirmation message
            await interaction.reply({ 
                content: verificationConfig.successMessage || '`✅` **Verification completed successfully!**', 
                ephemeral: true 
            });
            
            logger.info(`✅ User ${member.user.tag} verified in server ${interaction.guild.name}`);
            
            // Send message to log channel if configured
            if (verificationConfig.logChannel) {
                const logChannel = interaction.guild.channels.cache.get(verificationConfig.logChannel);
                if (logChannel) {
                    await logChannel.send({
                        content: `✅ **${member.user.tag}** has been verified successfully!`
                    });
                }
            }
            
        } catch (error) {
            logger.error(`Error verifying user: ${error.message}`);
            await interaction.reply({ 
                content: '`❌` **Error during verification. Contact an administrator.**', 
                ephemeral: true 
            });
        }
    }
    
    // Handle verification setup buttons
    if (interaction.customId.startsWith('setup_') || interaction.customId === 'test_verification') {
        try {
            // Check administrator permissions
            if (!interaction.member.permissions.has('Administrator')) {
                return interaction.reply({
                    content: '`❌` **You don\'t have permission to configure the system.**',
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
                    logger.warn(`Unrecognized button: ${interaction.customId}`);
                    break;
            }
        } catch (error) {
            logger.error(`Error handling setup: ${error.message}`);
            await interaction.reply({
                content: '`❌` **Error during configuration.**',
                ephemeral: true
            });
        }
    }
}

async function handleSelectMenuInteraction(interaction) {
    // Handle verification setup menu
    if (interaction.customId === 'setup_verification_menu') {
        try {
            // Check administrator permissions
            if (!interaction.member.permissions.has('Administrator')) {
                return interaction.reply({
                    content: '`❌` **You don\'t have permission to configure the system.**',
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
                    logger.warn(`Unrecognized menu option: ${selectedValue}`);
                    await interaction.reply({
                        content: '`❌` **Unrecognized option.**',
                        ephemeral: true
                    });
                    break;
            }
        } catch (error) {
            logger.error(`Error handling menu: ${error.message}`);
            await interaction.reply({
                content: '`❌` **Error during configuration.**',
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
        logger.error(`Error handling modal: ${error.message}`);
        await interaction.reply({
            content: '`❌` **Error during configuration.**',
            ephemeral: true
        });
    }
}

// Helper functions for setup
async function handleEnableVerification(interaction) {
    const database = interaction.client.database;
    const guildId = interaction.guild.id;
    const verificationConfig = await database.getVerificationConfig(guildId);
    
    const currentStatus = verificationConfig.enabled;
    const newStatus = !currentStatus;
    
    // Update in database
    await database.updateVerificationConfig(guildId, { enabled: newStatus });
    
    // Update embed in real time
    await updateSetupEmbed(interaction, guildId);
    
    await interaction.reply({
        content: `\`${currentStatus ? '❌' : '✅'}\` **Verification system ${currentStatus ? 'disabled' : 'enabled'} successfully!**`,
        ephemeral: true
    });
}

async function handleSetVerifiedRole(interaction) {
    const database = interaction.client.database;
    const guildId = interaction.guild.id;
    const verificationConfig = await database.getVerificationConfig(guildId);

    const modal = new ModalBuilder()
        .setCustomId('modal_verified_role')
        .setTitle('Set Verified Role');

    const roleInput = new TextInputBuilder()
        .setCustomId('verified_role_input')
        .setLabel('Role ID to assign')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Ex: 1234567890123456789')
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
        .setTitle('Set Log Channel');

    const channelInput = new TextInputBuilder()
        .setCustomId('log_channel_input')
        .setLabel('Channel ID for logs')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Ex: 1234567890123456789')
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
        .setTitle('Customize Verification Button');

    const textInput = new TextInputBuilder()
        .setCustomId('button_text_input')
        .setLabel('Button text')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Ex: Verify')
        .setValue(verificationConfig.buttonText || 'Verify')
        .setRequired(true);

    const emojiInput = new TextInputBuilder()
        .setCustomId('button_emoji_input')
        .setLabel('Button emoji')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Ex: ✅')
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
        .setTitle('Customize Colors');

    const buttonColorInput = new TextInputBuilder()
        .setCustomId('button_color_input')
        .setLabel('Button color')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Success, Primary, Secondary, Danger')
        .setValue(verificationConfig.buttonColor || 'Success')
        .setRequired(true);

    const embedColorInput = new TextInputBuilder()
        .setCustomId('embed_color_input')
        .setLabel('Embed color (hexadecimal)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Ex: #0099ff')
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
        .setTitle('Customize Verification Embed');

    const titleInput = new TextInputBuilder()
        .setCustomId('embed_title_input')
        .setLabel('Embed title')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Ex: 🔐 **Server Verification**')
        .setValue(verificationConfig.embed?.title || '🔐 **Server Verification**')
        .setRequired(true);

    const descriptionInput = new TextInputBuilder()
        .setCustomId('embed_description_input')
        .setLabel('Embed description')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Enter embed description...')
        .setValue(verificationConfig.embed?.description || 'Welcome to the server! To access channels, you must first verify yourself.\n\n**Click the button below to verify and receive the necessary permissions.**')
        .setRequired(true);

    const thumbnailInput = new TextInputBuilder()
        .setCustomId('embed_thumbnail_input')
        .setLabel('Thumbnail URL (optional)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Ex: https://example.com/image.png')
        .setValue(verificationConfig.embed?.thumbnail || '')
        .setRequired(false);

    const footerTextInput = new TextInputBuilder()
        .setCustomId('embed_footer_text_input')
        .setLabel('Footer text')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Ex: EchoBot Discord - Verification System')
        .setValue(verificationConfig.embed?.footer?.text || 'EchoBot Discord - Verification System')
        .setRequired(false);

    const footerIconInput = new TextInputBuilder()
        .setCustomId('embed_footer_icon_input')
        .setLabel('Footer icon URL (optional)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Ex: https://example.com/icon.png')
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
        .setTitle('Set Verification Channel');

    const channelInput = new TextInputBuilder()
        .setCustomId('verification_channel_input')
        .setLabel('Channel ID for verification embed')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Ex: 1234567890123456789')
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
            content: '`❌` **Verification channel not configured. Configure the channel first.**',
            ephemeral: true
        });
    }

    const verificationChannel = interaction.guild.channels.cache.get(verificationConfig.verificationChannel);
    if (!verificationChannel) {
        return interaction.reply({
            content: '`❌` **Verification channel not found in server.**',
            ephemeral: true
        });
    }

    try {
        const verificationEmbed = new EmbedBuilder()
            .setColor(verificationConfig.embedColor || config.embed.colors.primary)
            .setTitle(verificationConfig.embed?.title || '🔐 **Server Verification**')
            .setDescription(verificationConfig.embed?.description || 'Welcome to the server! To access channels, you must first verify yourself.\n\n**Click the button below to verify and receive the necessary permissions.**');
        
        // Add thumbnail if configured
        if (verificationConfig.embed?.thumbnail) {
            verificationEmbed.setThumbnail(verificationConfig.embed.thumbnail);
        }
        
        // Add footer if configured
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
        
        // Add timestamp if configured
        if (verificationConfig.embed?.timestamp !== false) {
            verificationEmbed.setTimestamp();
        }

        // Determine button color
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
            .setLabel(verificationConfig.buttonText || 'Verify')
            .setStyle(buttonStyle)
            .setEmoji(verificationConfig.buttonEmoji || '✅');

        const row = new ActionRowBuilder().addComponents(verifyButton);

        await verificationChannel.send({
            embeds: [verificationEmbed],
            components: [row]
        });

        await interaction.reply({
            content: `\`✅\` **Verification embed sent successfully to ${verificationChannel}!**`,
            ephemeral: true
        });

    } catch (error) {
        logger.error(`Error sending verification embed: ${error.message}`);
        await interaction.reply({
            content: '`❌` **Error sending verification embed.**',
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
            content: '`❌` **Verification system is not enabled.**',
            ephemeral: true
        });
    }

    if (!verificationConfig.verifiedRole) {
        return interaction.reply({
            content: '`❌` **Verification role not configured.**',
            ephemeral: true
        });
    }

    const verifiedRole = interaction.guild.roles.cache.get(verificationConfig.verifiedRole);
    if (!verifiedRole) {
        return interaction.reply({
            content: '`❌` **Verification role not found in server.**',
            ephemeral: true
        });
    }

    // Simulate verification
    await interaction.reply({
        content: `\`✅\` **Test completed!** The system is working correctly.\n\n**Role:** ${verifiedRole}\n**Button text:** ${verificationConfig.buttonText}\n**Button emoji:** ${verificationConfig.buttonEmoji}`,
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
            .setTitle('🔧 **Verification System Setup**')
            .setDescription('Configure the verification system for your server.\n\n**How it works:**\n1. New members receive a welcome message with a verification button\n2. When they click the button, they automatically receive the verified role\n3. The system is fully customizable\n\n**Current configuration:**')
            .addFields(
                { 
                    name: '📋 System Status', 
                    value: verificationConfig.enabled ? '`✅` Enabled' : '`❌` Disabled', 
                    inline: true 
                },
                { 
                    name: '🎭 Verified Role', 
                    value: verificationConfig.verifiedRole ? `<@&${verificationConfig.verifiedRole}>` : '`❌` Not configured', 
                    inline: true 
                },
                { 
                    name: '📝 Log Channel', 
                    value: verificationConfig.logChannel ? `<#${verificationConfig.logChannel}>` : '`❌` Not configured', 
                    inline: true 
                },
                { 
                    name: '🔘 Button Text', 
                    value: verificationConfig.buttonText || 'Verify', 
                    inline: true 
                },
                { 
                    name: '😀 Button Emoji', 
                    value: verificationConfig.buttonEmoji || '✅', 
                    inline: true 
                },
                { 
                    name: '🎨 Button Color', 
                    value: verificationConfig.buttonColor || 'Success', 
                    inline: true 
                },
                { 
                    name: '🌈 Embed Color', 
                    value: verificationConfig.embedColor || '#0099ff', 
                    inline: true 
                },
                { 
                    name: '📝 Embed Title', 
                    value: verificationConfig.embed?.title || '🔐 **Server Verification**', 
                    inline: false 
                },
                { 
                    name: '📄 Embed Description', 
                    value: verificationConfig.embed?.description?.substring(0, 50) + '...' || 'Welcome to the server! To access channels...', 
                    inline: false 
                }
            )
            .setFooter({ text: 'Click the buttons below to configure the system' })
            .setTimestamp();

        const setupMenu = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('setup_verification_menu')
                    .setPlaceholder('Select an action to configure the system...')
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel(verificationConfig.enabled ? 'Disable System' : 'Enable System')
                            .setDescription(verificationConfig.enabled ? 'Disable verification system' : 'Enable verification system')
                            .setValue('toggle_system')
                            .setEmoji(verificationConfig.enabled ? '❌' : '✅'),
                        
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Set Verified Role')
                            .setDescription('Configure the role to assign after verification')
                            .setValue('set_verified_role')
                            .setEmoji('🎭'),
                        
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Set Verification Channel')
                            .setDescription('Configure the channel to send verification embed')
                            .setValue('set_verification_channel')
                            .setEmoji('📢'),
                        
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Set Log Channel')
                            .setDescription('Configure the channel for verification logs')
                            .setValue('set_log_channel')
                            .setEmoji('📝'),
                        
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Customize Button')
                            .setDescription('Customize button text and emoji')
                            .setValue('customize_button')
                            .setEmoji('🔧'),
                        
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Customize Colors')
                            .setDescription('Customize button and embed colors')
                            .setValue('customize_colors')
                            .setEmoji('🎨'),
                        
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Customize Embed')
                            .setDescription('Customize title, description and other embed elements')
                            .setValue('customize_embed')
                            .setEmoji('📝'),
                        
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Send Verification Embed')
                            .setDescription('Send verification embed to configured channel')
                            .setValue('send_verification_embed')
                            .setEmoji('📤'),
                        
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Test System')
                            .setDescription('Test verification system configuration')
                            .setValue('test_verification')
                            .setEmoji('🧪')
                    )
            );

        await interaction.message.edit({
            embeds: [setupEmbed],
            components: [setupMenu]
        });
    } catch (error) {
        logger.error(`Error updating embed: ${error.message}`);
    }
}

// Functions to handle modal submit
async function handleVerifiedRoleModal(interaction) {
    const roleId = interaction.fields.getTextInputValue('verified_role_input');
    const database = interaction.client.database;
    const guildId = interaction.guild.id;
    
    // Verify role exists
    const role = interaction.guild.roles.cache.get(roleId);
    if (!role) {
        return interaction.reply({
            content: '`❌` **Role not found in server. Verify the role ID.**',
            ephemeral: true
        });
    }
    
    // Update in database
    await database.updateVerificationConfig(guildId, { verifiedRole: roleId });
    
    // Update embed in real time
    await updateSetupEmbed(interaction, guildId);
    
    await interaction.reply({
        content: `\`✅\` **Verification role set:** ${role}`,
        ephemeral: true
    });
}

async function handleLogChannelModal(interaction) {
    const channelId = interaction.fields.getTextInputValue('log_channel_input');
    const database = interaction.client.database;
    const guildId = interaction.guild.id;
    
    if (channelId) {
        // Verify channel exists
        const channel = interaction.guild.channels.cache.get(channelId);
        if (!channel) {
            return interaction.reply({
                content: '`❌` **Channel not found in server. Verify the channel ID.**',
                ephemeral: true
            });
        }
    }
    
    // Update in database
    await database.updateVerificationConfig(guildId, { logChannel: channelId || null });
    
    // Update embed in real time
    await updateSetupEmbed(interaction, guildId);
    
    await interaction.reply({
        content: `\`✅\` **Log channel ${channelId ? 'set' : 'removed'} successfully!**`,
        ephemeral: true
    });
}

async function handleButtonCustomizeModal(interaction) {
    const buttonText = interaction.fields.getTextInputValue('button_text_input');
    const buttonEmoji = interaction.fields.getTextInputValue('button_emoji_input');
    const database = interaction.client.database;
    const guildId = interaction.guild.id;
    
    // Update in database
    await database.updateVerificationConfig(guildId, { 
        buttonText: buttonText,
        buttonEmoji: buttonEmoji
    });
    
    // Update embed in real time
    await updateSetupEmbed(interaction, guildId);
    
    await interaction.reply({
        content: `\`✅\` **Button customized successfully!**\n\n**Text:** ${buttonText}\n**Emoji:** ${buttonEmoji}`,
        ephemeral: true
    });
}

async function handleVerificationChannelModal(interaction) {
    const channelId = interaction.fields.getTextInputValue('verification_channel_input');
    const database = interaction.client.database;
    const guildId = interaction.guild.id;
    
    // Verify channel exists
    const channel = interaction.guild.channels.cache.get(channelId);
    if (!channel) {
        return interaction.reply({
            content: '`❌` **Channel not found in server. Verify the channel ID.**',
            ephemeral: true
        });
    }
    
    // Update in database
    await database.updateVerificationConfig(guildId, { verificationChannel: channelId });
    
    // Update embed in real time
    await updateSetupEmbed(interaction, guildId);
    
    await interaction.reply({
        content: `\`✅\` **Verification channel set:** ${channel}`,
        ephemeral: true
    });
}

async function handleCustomizeColorsModal(interaction) {
    const buttonColor = interaction.fields.getTextInputValue('button_color_input');
    const embedColor = interaction.fields.getTextInputValue('embed_color_input');
    const database = interaction.client.database;
    const guildId = interaction.guild.id;
    
    // Validate button color
    const validButtonColors = ['Success', 'Primary', 'Secondary', 'Danger'];
    if (!validButtonColors.includes(buttonColor)) {
        return interaction.reply({
            content: '`❌` **Invalid button color. Use: Success, Primary, Secondary, Danger**',
            ephemeral: true
        });
    }
    
    // Validate embed color (hexadecimal format)
    const hexColorRegex = /^#[0-9A-F]{6}$/i;
    if (!hexColorRegex.test(embedColor)) {
        return interaction.reply({
            content: '`❌` **Invalid embed color. Use hexadecimal format (e.g. #0099ff)**',
            ephemeral: true
        });
    }

    // Update in database
    await database.updateVerificationConfig(guildId, { 
        buttonColor: buttonColor,
        embedColor: embedColor
    });
    
    // Update embed in real time
    await updateSetupEmbed(interaction, guildId);
    
    await interaction.reply({
        content: `\`✅\` **Colors customized successfully!**\n\n**Button color:** ${buttonColor}\n**Embed color:** ${embedColor}`,
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
    
    // Validate thumbnail URL if provided
    if (thumbnail && !isValidUrl(thumbnail)) {
        return interaction.reply({
            content: '`❌` **Invalid thumbnail URL.**',
            ephemeral: true
        });
    }
    
    // Validate footer icon URL if provided
    if (footerIcon && !isValidUrl(footerIcon)) {
        return interaction.reply({
            content: '`❌` **Invalid footer icon URL.**',
            ephemeral: true
        });
    }
    
    // Prepare embed object
    const embedConfig = {
        title: title,
        description: description,
        thumbnail: thumbnail || null,
        footer: {
            text: footerText || 'EchoBot Discord - Verification System',
            iconURL: footerIcon || null
        },
        timestamp: true
    };

    // Update in database
    await database.updateVerificationConfig(guildId, { 
        embed: embedConfig
    });
    
    // Update embed in real time
    await updateSetupEmbed(interaction, guildId);
    
    await interaction.reply({
        content: `\`✅\` **Embed customized successfully!**\n\n**Title:** ${title}\n**Description:** ${description.substring(0, 50)}...`,
        ephemeral: true
    });
}

// Helper function to validate URLs
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}
