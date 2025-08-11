const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, PermissionFlagsBits } = require('discord.js');
const logger = require('../../utils/logger.js');
const config = require('../../config.js');

module.exports = {
    name: 'setup-verify',
    description: 'Configure the verification system for the server',
    category: 'Administration',
    enabled: true,
    
    data: new SlashCommandBuilder()
        .setName('setup-verify')
        .setDescription('Configure the verification system for the server')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction) {
        try {
            // Check permissions
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({
                    content: '`❌` **You don\'t have permission to use this command.**',
                    ephemeral: true
                });
            }

            // Load configuration from database
            const database = interaction.client.database;
            const guildId = interaction.guild.id;
            let verificationConfig = await database.getVerificationConfig(guildId);
            
            // If it doesn't exist in database, use default configuration
            if (!verificationConfig) {
                verificationConfig = {
                    enabled: false,
                    verifiedRole: null,
                    buttonText: 'Verify',
                    buttonEmoji: '✅',
                    successMessage: '`✅` **Verification completed successfully!**',
                    logChannel: null
                };
                // Save default configuration to database
                await database.saveVerificationConfig(guildId, verificationConfig);
            }

            const setupEmbed = new EmbedBuilder()
                .setColor(config.embed.colors.primary)
                .setTitle('🔧 **Verification System Setup**')
                .setDescription('Configure the verification system for your server.\n\n**How it works:**\n1. New members receive a welcome message with a verification button\n2. When they click the button, they automatically receive the verified role\n3. The system is completely customizable\n\n**Current configuration:**')
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
                        name: '📢 Verification Channel', 
                        value: verificationConfig.verificationChannel ? `<#${verificationConfig.verificationChannel}>` : '`❌` Not configured', 
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
                                .setDescription(verificationConfig.enabled ? 'Disable the verification system' : 'Enable the verification system')
                                .setValue('toggle_system')
                                .setEmoji(verificationConfig.enabled ? '❌' : '✅'),
                            
                            new StringSelectMenuOptionBuilder()
                                .setLabel('Set Verified Role')
                                .setDescription('Configure the role to assign after verification')
                                .setValue('set_verified_role')
                                .setEmoji('🎭'),
                            
                            new StringSelectMenuOptionBuilder()
                                .setLabel('Set Verification Channel')
                                .setDescription('Configure the channel to send the verification embed')
                                .setValue('set_verification_channel')
                                .setEmoji('📢'),
                            
                            new StringSelectMenuOptionBuilder()
                                .setLabel('Set Log Channel')
                                .setDescription('Configure the channel for verification logs')
                                .setValue('set_log_channel')
                                .setEmoji('📝'),
                            
                            new StringSelectMenuOptionBuilder()
                                .setLabel('Customize Button')
                                .setDescription('Customize text and emoji of the verification button')
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
                                .setDescription('Send the verification embed to the configured channel')
                                .setValue('send_verification_embed')
                                .setEmoji('📤'),
                            
                            new StringSelectMenuOptionBuilder()
                                .setLabel('Test System')
                                .setDescription('Test the verification system configuration')
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
            logger.error(`Error in setup-verify command: ${error.message}`);
            await interaction.reply({
                content: '`❌` **Error during verification system configuration.**',
                ephemeral: true
            });
        }
    }
};
