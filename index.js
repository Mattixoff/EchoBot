const { Client, GatewayIntentBits, Collection } = require('discord.js');
const config = require('./config.js');
const logger = require('./utils/logger.js');
const CommandHandler = require('./handlers/commandHandler.js');
const EventHandler = require('./handlers/eventHandler.js');
const database = require('./utils/database.js');

// Discord client creation
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ]
});

// Initialize collections
client.commands = new Collection();
client.cooldowns = new Collection();

// Initialize handlers
const commandHandler = new CommandHandler(client);
const eventHandler = new EventHandler(client);

// Make handlers globally available
client.commandHandler = commandHandler;
client.eventHandler = eventHandler;
client.database = database;

// Ready event
client.once('ready', () => {
    logger.success(`Bot ${client.user.tag} is online!`);
    logger.info(`Bot ID: ${client.user.id}`);
    logger.info(`Servers: ${client.guilds.cache.size}`);
    logger.info(`Users: ${client.users.cache.size}`);
});

// Handle unhandled errors
process.on('unhandledRejection', (error) => {
    logger.error('Unhandled error:', error);
});

process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception:', error);
    process.exit(1);
});

// Handle clean shutdown
process.on('SIGINT', async () => {
    logger.info('🛑 Shutting down bot...');
    
    if (config.database.enabled && database.isConnected) {
        await database.disconnect();
    }
    
    process.exit(0);
});

process.on('SIGTERM', async () => {
    logger.info('🛑 Shutting down bot...');
    
    if (config.database.enabled && database.isConnected) {
        await database.disconnect();
    }
    
    process.exit(0);
});

// Handle slash commands
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    try {
        await commandHandler.handleSlashCommand(interaction);
    } catch (error) {
        logger.error(`Error handling slash command: ${error.message}`);
        
        const errorMessage = '`❌` **An error occurred while executing the command.**';
        
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: errorMessage, ephemeral: true });
        } else {
            await interaction.reply({ content: errorMessage, ephemeral: true });
        }
    }
});

// Main function to initialize the bot
async function initializeBot() {
    try {
        logger.info('🚀 Initializing Discord bot...');
        
        // Connect to database
        if (config.database.enabled) {
            logger.info('🗄️ Connecting to database...');
            await database.connect();
        }
        
        // Load commands
        logger.info('📋 Loading commands...');
        await commandHandler.loadCommands();
        
        // Load events
        logger.info('📡 Loading events...');
        await eventHandler.loadEvents();
        
        // Register events
        logger.info('🔗 Registering events...');
        await eventHandler.registerEvents();
        
        // Bot login
        logger.info('🔐 Bot login...');
        await client.login(config.bot.token);
        
        // Register slash commands after login
        logger.info('🔗 Registering slash commands...');
        await commandHandler.registerSlashCommands();
        
    } catch (error) {
        logger.error('Error during bot initialization:', error.message);
        process.exit(1);
    }
}

// Start the bot
initializeBot();
