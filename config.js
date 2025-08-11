module.exports = {
    // Main bot configuration
    bot: {
        token: '',
        prefix: '!', // No longer used with slash commands
        status: 'idle', // online, idle, dnd, invisible
        activity: {
            type: 'WATCHING', // PLAYING, STREAMING, LISTENING, WATCHING, COMPETING
            text: 'EchoStudios'
        }
    },
    
    // Commands configuration
    commands: {
        cooldown: 3000, // 3 seconds default
        deleteAfter: false, // if true, delete command messages after execution
        defaultPermissions: [], // default permissions for all commands
        globalCooldown: false, // if true, global cooldown for all commands
        maxArgs: 10 // maximum number of arguments per command
    },
    
    // Events configuration
    events: {
        enabled: true,
        logAll: false, // if true, log all events
        ignoreEvents: [], // events to ignore
        customEvents: [] // custom events
    },
    
    // Logging configuration
    logging: {
        enabled: true,
        level: 'debug', // 'debug', 'info', 'warn', 'error'
        showTimestamp: true,
        showColors: true,
        logToFile: false, // if true, save logs to file
        logFile: 'logs/bot.log',
        maxLogFiles: 10,
        maxLogSize: '10MB'
    },
    
    // Embed configuration
    embed: {
        colors: {
            primary: '#0099ff',
            success: '#00ff00',
            error: '#ff0000',
            warning: '#ffff00',
            info: '#00ffff',
            default: '#2f3136'
        },
        footer: {
            text: 'EchoBot Discord',
            iconURL: null
        },
        timestamp: true
    },
    
    // Moderation configuration
    moderation: {
        enabled: true,
        autoMod: false,
        logChannel: null, // Channel ID for moderation logs
        warnThreshold: 3, // number of warnings before ban
        muteRole: null, // Mute role ID
        logActions: ['ban', 'kick', 'mute', 'warn']
    },
    
    // Advanced features configuration
    features: {
        welcome: {
            enabled: true,
            channel: 'YOUR_WELCOME_CHANNEL_ID', // Replace with the ID of the channel where you want welcome messages
            message: 'Welcome {user} to {server}!'
        },
        verification: {
            enabled: false,
            verifiedRole: null, // Role ID to assign after verification
            buttonText: 'Verify',
            buttonEmoji: '✅',
            buttonColor: 'Success', // Success, Primary, Secondary, Danger
            embedColor: '#0099ff', // Verification embed color
            successMessage: '`✅` **Verification completed successfully!**',
            logChannel: null, // Channel ID for verification logs
            embed: {
                title: '🔐 **Server Verification**',
                description: 'Welcome to the server! To access channels, you must first verify yourself.\n\n**Click the button below to verify yourself and receive the necessary permissions.**',
                thumbnail: 'https://cdn.discordapp.com/attachments/1337528677709123747/1343224165158879244/ECHO6.png?ex=67bc7e7c&is=67bb2cfc&hm=de338572ae1151a26118ceadc58130f1874fe1459409c27f93cebbc5f052cbff&',
                footer: {
                    text: 'EchoBot Discord - Verification System',
                    iconURL: null
                },
                timestamp: true
            }
        },
        autoRole: {
            enabled: false,
            roles: [] // array of role IDs to assign automatically
        },
        leveling: {
            enabled: false,
            xpRate: 1, // XP multiplier
            levelUpChannel: null // channel for level up messages
        }
    },
    
    // MongoDB database configuration
    database: {
        enabled: true,
        type: 'mongodb',
        url: '',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000
        },
        collections: {
            users: 'users',
            guilds: 'guilds',
            commands: 'commands',
            logs: 'logs',
            warnings: 'warnings',
            levels: 'levels'
        }
    },
    
    // External APIs configuration
    apis: {
        discord: {
            baseURL: 'https://discord.com/api/v10',
            timeout: 10000
        },
        // Add other APIs here
    },
    
    // Development configuration
    development: {
        debug: true,
        testMode: false,
        devGuilds: [], // array of server IDs for testing
        reloadCommands: true, // automatically reload commands in development
        logLevel: 'debug'
    }
};
