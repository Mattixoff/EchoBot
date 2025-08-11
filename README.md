# 🤖 EchoBot Discord

Official EchoStudios Discord bot with command and event handling system, slash command support, advanced logging system, and complete moderation and verification functionality.

## ✨ Features

- **Slash Commands**: Modern and intuitive commands
- **Category System**: Automatic organization of commands and events
- **Advanced Logging**: Colored tables to monitor loading
- **Automatic Handlers**: Automatic loading of commands and events from subfolders
- **Error Handling**: Robust system for error management
- **Cooldown**: Command cooldown system
- **Permissions**: Integrated permission control
- **MongoDB Database**: Complete data persistence system
- **Verification System**: Completely customizable verification system
- **Welcome System**: Customizable welcome messages
- **Interactive Interface**: Dropdown menus and modals for configuration

## 🚀 Installation

### Prerequisites
- Node.js 16.9.0 or higher
- NPM or Yarn
- Discord bot configured on [Discord Developer Portal](https://discord.com/developers/applications)
- MongoDB Atlas database (optional but recommended)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd EchoBot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure the bot**
   - Copy `config.js` and modify the settings
   - Insert your Discord token
   - Configure MongoDB Atlas database URL (optional)

4. **Start the bot**
   ```bash
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```

## ⚙️ Configuration

### config.js
```javascript
module.exports = {
    // Main bot configuration
    bot: {
        token: 'YOUR_TOKEN_HERE',
        prefix: '!', // No longer used with slash commands
        status: 'online', // online, idle, dnd, invisible
        activity: {
            type: 'WATCHING', // PLAYING, STREAMING, LISTENING, WATCHING, COMPETING
            text: 'EchoStudios'
        }
    },
    
    // Command configuration
    commands: {
        cooldown: 3000,
        deleteAfter: false,
        defaultPermissions: [],
        globalCooldown: false,
        maxArgs: 10
    },
    
    // Logging configuration
    logging: {
        enabled: true,
        level: 'debug',
        showTimestamp: true,
        showColors: true,
        logToFile: false
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
    
    // Advanced features configuration
    features: {
        welcome: {
            enabled: true,
            channel: 'YOUR_WELCOME_CHANNEL_ID',
            message: 'Welcome {user} to {server}!'
        },
        verification: {
            enabled: false,
            verifiedRole: null,
            buttonText: 'Verify',
            buttonEmoji: '✅',
            buttonColor: 'Success', // Success, Primary, Secondary, Danger
            embedColor: '#0099ff',
            successMessage: '`✅` **Verification completed successfully!**',
            logChannel: null,
            embed: {
                title: '🔐 **Server Verification**',
                description: 'Welcome to the server! To access channels, you must first verify yourself.',
                thumbnail: 'https://example.com/image.png',
                footer: {
                    text: 'EchoBot Discord - Verification System',
                    iconURL: null
                },
                timestamp: true
            }
        }
    },
    
    // MongoDB database configuration
    database: {
        enabled: true,
        type: 'mongodb',
        url: 'mongodb+srv://username:password@cluster.mongodb.net/database',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000
        }
    }
    
    // ... other available configurations
};
```

### Available Configuration Categories

#### `bot` - Main configuration
- `token`: Discord bot token
- `prefix`: Command prefix (not used with slash commands)
- `status`: Bot status (online, idle, dnd, invisible)
- `activity`: Bot activity (type and text)

#### `commands` - Command configuration
- `cooldown`: Default cooldown for commands
- `deleteAfter`: Whether to delete command messages
- `defaultPermissions`: Default permissions
- `globalCooldown`: Global cooldown for all commands
- `maxArgs`: Maximum number of arguments

#### `events` - Event configuration
- `enabled`: Whether events are enabled
- `logAll`: Whether to log all events
- `ignoreEvents`: Events to ignore
- `customEvents`: Custom events

#### `logging` - Logging configuration
- `enabled`: Whether logging is enabled
- `level`: Log level (debug, info, warn, error)
- `showTimestamp`: Whether to show timestamps
- `showColors`: Whether to show colors
- `logToFile`: Whether to save logs to file
- `logFile`: Log file path
- `maxLogFiles`: Maximum number of log files
- `maxLogSize`: Maximum log file size

#### `embed` - Embed configuration
- `colors`: Colors for different types of embeds
- `footer`: Default footer for embeds
- `timestamp`: Whether to add automatic timestamps

#### `moderation` - Moderation configuration
- `enabled`: Whether moderation is enabled
- `autoMod`: Whether auto-moderation is active
- `logChannel`: Channel for moderation logs
- `warnThreshold`: Warning threshold before ban
- `muteRole`: Default mute role
- `logActions`: Actions to log

#### `features` - Advanced features
- `welcome`: Customizable welcome system
- `verification`: Completely customizable verification system
- `autoRole`: Automatic role assignment
- `leveling`: Level system

#### `database` - MongoDB database configuration
- `enabled`: Whether database is enabled
- `type`: Database type (mongodb)
- `url`: MongoDB Atlas connection URL
- `options`: MongoDB connection options
- `collections`: Collection names for different features

#### `development` - Development configuration
- `debug`: Debug mode
- `testMode`: Test mode
- `devGuilds`: Servers for testing
- `reloadCommands`: Automatic command reload
- `logLevel`: Log level for development

### Bot Permissions
The bot requires the following permissions:
- `applications.commands` - For slash commands
- `Send Messages` - To send messages
- `Use Slash Commands` - To use slash commands
- `View Audit Log` - For some utility commands
- `Manage Roles` - For verification system
- `Embed Links` - To send embeds
- `Attach Files` - To attach files

## 📁 Project Structure

```
EchoBot/
├── commands/           # Commands organized by category
│   ├── general/       # General commands
│   ├── entertainment/ # Entertainment commands
│   ├── utility/       # Utility commands
│   └── administration/ # Administrative commands
├── events/            # Events organized by category
│   └── general/       # General events
├── handlers/          # Handling system
├── utils/             # Utilities, logger and database
├── config.js          # Bot configuration
├── index.js           # Main file
└── package.json       # Dependencies
```

## 🎯 Creating Commands

### Basic Structure
```javascript
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'commandname',
    description: 'Command description',
    category: 'Category',
    cooldown: 5,
    enabled: true,
    
    data: new SlashCommandBuilder()
        .setName('commandname')
        .setDescription('Command description')
        .addStringOption(option =>
            option.setName('parameter')
                .setDescription('Parameter description')
                .setRequired(true)),
    
    async execute(interaction) {
        // Command logic
        await interaction.reply('Response!');
    }
};
```

### Available Options
- **StringOption**: Text
- **IntegerOption**: Whole numbers
- **BooleanOption**: True/False
- **UserOption**: Users
- **ChannelOption**: Channels
- **RoleOption**: Roles

## 📡 Creating Events

### Basic Structure
```javascript
module.exports = {
    name: 'eventName',
    category: 'Category',
    enabled: true,
    once: false, // true for events that trigger only once
    
    execute(...args) {
        // Event logic
        console.log('Event triggered!');
    }
};
```

## 🔧 Available Commands

### General
- `/ping` - Bot latency test
- `/help` - List of available commands

### Entertainment
- `/8ball <question>` - Magic ball

### Utility
- `/userinfo [user]` - Information about a user
- `/dbstats` - MongoDB database statistics

### Administration
- `/setup-verify` - Configure server verification system

## 🔐 Verification System

The bot includes a completely customizable verification system that allows administrators to:

### Main Features
- **Interactive Configuration**: Dropdown menus for easy configuration
- **Complete Customization**: Every aspect of the verification embed is customizable
- **Data Persistence**: All configurations are saved in MongoDB database
- **Real-time Updates**: Interface automatically updates after each modification

### Customizable Elements

#### **Verification Button**
- **Text**: Customize button text
- **Emoji**: Add an emoji to the button
- **Color**: Choose between Success (green), Primary (blue), Secondary (gray), Danger (red)

#### **Verification Embed**
- **Title**: Customize embed title
- **Description**: Modify complete description (supports markdown)
- **Color**: Set embed color (hexadecimal format)
- **Thumbnail**: Add an image to the embed
- **Footer**: Customize footer text and icon
- **Timestamp**: Enable/disable timestamp

#### **System Configuration**
- **Verified Role**: Set the role to assign after verification
- **Verification Channel**: Choose where to send the verification embed
- **Log Channel**: Configure a channel for verification logs
- **Success Message**: Customize confirmation message

### How to Use

1. **Execute** `/setup-verify` (requires administrator permissions)
2. **Configure** the system using the dropdown menu:
   - **Enable/Disable System**: Activate or deactivate the system
   - **Set Verified Role**: Configure the role to assign
   - **Set Verification Channel**: Choose where to send the embed
   - **Set Log Channel**: Configure logs
   - **Customize Button**: Modify button text, emoji and color
   - **Customize Colors**: Set button and embed colors
   - **Customize Embed**: Modify title, description, thumbnail and footer
   - **Send Verification Embed**: Send the embed to the configured channel
   - **Test System**: Verify that everything works correctly

3. **Users** can verify themselves by clicking the button in the embed

### Advanced Configuration Example

```javascript
// Custom embed configuration
embed: {
    title: '🎉 **Welcome to Our Server!**',
    description: 'Hello! We\'re happy to have you here.\n\nTo start chatting, click the verification button below.\n\n**Server rules:**\n• Respect all members\n• No spam\n• Have fun!',
    thumbnail: 'https://example.com/logo.png',
    footer: {
        text: 'Gaming Community Server',
        iconURL: 'https://example.com/icon.png'
    },
    timestamp: true
}
```

## 👋 Welcome System

The bot includes a welcome system that:

### Features
- **Customizable Message**: Completely customizable welcome embed
- **Verification Integration**: Automatically includes verification button if configured
- **Dynamic Variables**: Supports placeholders like `{user}` and `{server}`
- **Per-Server Configuration**: Each server can have its own configuration

### Configuration
```javascript
welcome: {
    enabled: true,
    channel: 'WELCOME_CHANNEL_ID',
    message: 'Welcome {user} to {server}!'
}
```

## 🗄️ MongoDB Database System

The bot uses MongoDB Atlas as the main database to store:
- **Users**: User information and preferences
- **Servers**: Specific configurations for each server
- **Verifications**: Complete verification system configurations for each server
- **Warnings**: Moderation and warning system
- **Levels**: XP and level system for users
- **Logs**: Bot action history
- **Commands**: Command usage statistics

### Features
- **Automatic Connection**: Connects automatically at startup
- **Error Handling**: Robust connection error handling
- **Clean Shutdown**: Proper disconnection at bot shutdown
- **CRUD Operations**: Complete methods for all operations
- **Statistics**: `/dbstats` command to monitor database
- **Per-Server Configurations**: Each server has its own customized configurations

### Supported Operations
- **User Management**: User creation, update, deletion
- **Server Management**: Specific configurations for each server
- **Verification System**: Saving and retrieving verification configurations
- **Statistics**: Database counts and metrics
- **Backup**: Data export and import

## 📊 Logging System

The bot includes an advanced logging system that shows:
- **Command Tables**: Loading status by category
- **Event Tables**: Registration status
- **Colored Logs**: Different log levels with colors
- **Timestamp**: Optional for each log
- **Informative Logs**: White messages for better readability

### Log Levels
- `debug` - Detailed information for development
- `info` - General information (white for better readability)
- `warn` - Warnings
- `error` - Errors
- `success` - Successfully completed operations

### Output Example
```
[2025-01-11T17:17:59.348Z] ℹ️  📊 Statistics: 2 servers, 1 users
[2025-01-11T17:17:59.348Z] ℹ️  🔗 Invite the bot: https://discord.com/api/oauth2/authorize?...
[2025-01-11T17:17:59.348Z] ✅ 🎉 Bot EchoBot#1234 is fully initialized!
```

## 🚨 Troubleshooting

### Bot doesn't respond to commands
1. Verify the bot has `applications.commands` permissions
2. Check that commands were registered correctly
3. Check logs for loading errors

### Commands not visible
1. Slash commands can take up to 1 hour to appear
2. Verify the bot is online
3. Check bot permissions in the server

### Loading errors
1. Verify command/event file syntax
2. Check that all required properties are present
3. Verify installed dependencies

### Problems with verification system
1. Verify the verification role exists in the server
2. Check that the verification channel is accessible to the bot
3. Verify bot permissions to manage roles
4. Check logs for specific errors

### Database problems
1. Verify internet connection
2. Check MongoDB Atlas database URL
3. Verify database credentials
4. Check logs for connection errors

## 🤝 Contributing

1. Fork the project
2. Create a branch for your feature
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is under MIT license. See the `LICENSE` file for details.

## 🆘 Support

For support or questions:
- Open an issue on GitHub
- Contact EchoStudios on Discord

---

**EchoBot** - Official EchoStudios Discord Bot 🚀

*Complete moderation, verification and server management system with interactive interface and advanced customization.*
