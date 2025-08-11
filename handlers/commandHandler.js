const fs = require('fs');
const path = require('path');
const { Collection, SlashCommandBuilder } = require('discord.js');
const logger = require('../utils/logger.js');

class CommandHandler {
    constructor(client) {
        this.client = client;
        this.commands = new Collection();
        this.commandCategories = new Collection();
        this.slashCommands = new Collection();
    }

    // Load all commands from subfolders
    async loadCommands() {
        const commandsPath = path.join(__dirname, '../commands');
        
        try {
            // Check if commands folder exists
            if (!fs.existsSync(commandsPath)) {
                logger.warn('Commands folder not found, creating...');
                fs.mkdirSync(commandsPath, { recursive: true });
                return;
            }

            // Read subfolders
            const categories = fs.readdirSync(commandsPath, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent.name);

            logger.info(`Found ${categories.length} command categories: ${categories.join(', ')}`);

            let totalCommands = 0;
            let loadedCommands = 0;

            // Load commands from each category
            for (const category of categories) {
                const categoryPath = path.join(commandsPath, category);
                const commandFiles = fs.readdirSync(categoryPath)
                    .filter(file => file.endsWith('.js'));

                logger.debug(`Loading category '${category}' with ${commandFiles.length} commands`);

                for (const file of commandFiles) {
                    totalCommands++;
                    try {
                        const filePath = path.join(categoryPath, file);
                        const command = require(filePath);

                        // Verify command has required properties
                        if (this.validateCommand(command, file)) {
                            command.category = category;
                            command.file = file;
                            command.enabled = command.enabled !== false; // Enable by default

                            this.commands.set(command.name, command);
                            
                            // Group by category
                            if (!this.commandCategories.has(category)) {
                                this.commandCategories.set(category, new Collection());
                            }
                            this.commandCategories.get(category).set(command.name, command);
                            
                            // Create slash command
                            if (command.data) {
                                this.slashCommands.set(command.name, command.data);
                            }
                            
                            loadedCommands++;
                            logger.debug(`Command '${command.name}' loaded from category '${category}'`);
                        } else {
                            logger.warn(`Command '${file}' is invalid, skipped`);
                        }
                    } catch (error) {
                        logger.error(`Error loading command '${file}': ${error.message}`);
                    }
                }
            }

            logger.success(`Commands loaded: ${loadedCommands}/${totalCommands}`);
            
            // Log command table
            const commandsArray = Array.from(this.commands.values());
            logger.logCommands(commandsArray);

        } catch (error) {
            logger.error(`Error loading commands: ${error.message}`);
        }
    }

    // Validate command structure
    validateCommand(command, filename) {
        const requiredProperties = ['name', 'description', 'data', 'execute'];
        const missingProperties = requiredProperties.filter(prop => !command[prop]);

        if (missingProperties.length > 0) {
            logger.warn(`Command '${filename}' missing properties: ${missingProperties.join(', ')}`);
            return false;
        }

        if (typeof command.execute !== 'function') {
            logger.warn(`Command '${filename}' has invalid execute property`);
            return false;
        }

        if (!(command.data instanceof SlashCommandBuilder)) {
            logger.warn(`Command '${filename}' has invalid data property (must be a SlashCommandBuilder)`);
            return false;
        }

        return true;
    }

    // Register slash commands on Discord
    async registerSlashCommands() {
        try {
            logger.info('🔗 Registering slash commands on Discord...');
            
            const commands = Array.from(this.slashCommands.values());
            
            if (commands.length === 0) {
                logger.warn('No slash commands to register');
                return;
            }

            // Register commands globally
            await this.client.application.commands.set(commands);
            
            logger.success(`${commands.length} slash commands registered successfully`);
            
        } catch (error) {
            logger.error(`Error registering slash commands: ${error.message}`);
        }
    }

    // Handle slash command execution
    async handleSlashCommand(interaction) {
        const command = this.commands.get(interaction.commandName);

        if (!command) {
            logger.error(`Command '${interaction.commandName}' not found`);
            return;
        }

        if (!command.enabled) {
            await interaction.reply({ 
                content: '`❌` **This command is currently disabled.**',
                ephemeral: true 
            });
            return;
        }

        try {
            // Check permissions if specified
            if (command.permissions) {
                const member = interaction.member;
                if (!member.permissions.has(command.permissions)) {
                    await interaction.reply({ 
                        content: '`❌` **You do not have permission to use this command.**',
                        ephemeral: true 
                    });
                    return;
                }
            }

            // Check cooldown if specified
            if (command.cooldown) {
                const cooldownAmount = (command.cooldown || 3) * 1000;
                const { cooldowns } = this.client;

                if (!cooldowns.has(command.name)) {
                    cooldowns.set(command.name, new Map());
                }

                const now = Date.now();
                const timestamps = cooldowns.get(command.name);

                if (timestamps.has(interaction.user.id)) {
                    const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

                    if (now < expirationTime) {
                        const timeLeft = (expirationTime - now) / 1000;
                        await interaction.reply({ 
                            content: `\`⏰\` **You must wait ${timeLeft.toFixed(1)} seconds before using the \`${command.name}\` command again.**`,
                            ephemeral: true 
                        });
                        return;
                    }
                }

                timestamps.set(interaction.user.id, now);
                setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
            }

            // Execute command
            await command.execute(interaction);
            logger.debug(`Slash command '${command.name}' executed by ${interaction.user.tag}`);

        } catch (error) {
            logger.error(`Error executing command '${command.name}': ${error.message}`);
            
            const errorMessage = '`❌` **An error occurred while executing the command.**';
            
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: errorMessage, ephemeral: true });
            } else {
                await interaction.reply({ content: errorMessage, ephemeral: true });
            }
        }
    }

    // Get all commands
    getAllCommands() {
        return this.commands;
    }

    // Get commands by specific category
    getCommandsByCategory(category) {
        return this.commandCategories.get(category) || new Collection();
    }

    // Get all categories
    getCategories() {
        return this.commandCategories;
    }

    // Get slash commands
    getSlashCommands() {
        return this.slashCommands;
    }
}

module.exports = CommandHandler;
