const logger = require('../../utils/logger.js');
const config = require('../../config.js');

module.exports = {
    name: 'ready',
    category: 'Generale',
    enabled: true,
    once: true,
    
    execute(client) {
        // Imposta lo status del bot
        client.user.setStatus(config.bot.status);
        
        // Imposta l'attività personalizzata
        if (config.bot.activity && config.bot.activity.text) {
            const activityType = config.bot.activity.type || 'WATCHING';
            client.user.setActivity(config.bot.activity.text, { type: activityType });
        }
        
        logger.success(`🎉 Bot ${client.user.tag} è completamente inizializzato!`);
        logger.info(`📊 Statistiche: ${client.guilds.cache.size} server, ${client.users.cache.size} utenti`);
        logger.info(`🔗 Invita il bot: https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`);
        
        // Log aggiuntivi se il debug è abilitato
        if (config.development.debug) {
            logger.debug(`🔧 Modalità debug attiva`);
            logger.debug(`📝 Livello log: ${config.logging.level}`);
            logger.debug(`🗄️ Database: ${config.database.enabled ? 'Abilitato' : 'Disabilitato'}`);
        }
    }
};
