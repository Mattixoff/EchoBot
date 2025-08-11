const logger = require('../../utils/logger.js');
const config = require('../../config.js');

module.exports = {
    name: 'ready',
    category: 'General',
    enabled: true,
    once: true,
    
    execute(client) {
        // Set bot status
        client.user.setStatus(config.bot.status);
        
        // Set custom activity
        if (config.bot.activity && config.bot.activity.text) {
            const activityType = config.bot.activity.type || 'WATCHING';
            client.user.setActivity(config.bot.activity.text, { type: activityType });
        }
        
        logger.success(`🎉 Bot ${client.user.tag} is fully initialized!`);
        logger.info(`📊 Statistics: ${client.guilds.cache.size} servers, ${client.users.cache.size} users`);
        logger.info(`🔗 Invite the bot: https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`);
        
        // Additional logs if debug is enabled
        if (config.development.debug) {
            logger.debug(`🔧 Debug mode active`);
            logger.debug(`📝 Log level: ${config.logging.level}`);
            logger.debug(`🗄️ Database: ${config.database.enabled ? 'Enabled' : 'Disabled'}`);
        }
    }
};
