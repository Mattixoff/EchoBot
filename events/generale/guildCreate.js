const logger = require('../../utils/logger.js');

module.exports = {
    name: 'guildCreate',
    category: 'Generale',
    enabled: true,
    once: false,
    
    execute(guild) {
        logger.success(`🎉 Bot aggiunto al server: ${guild.name} (ID: ${guild.id})`);
        logger.info(`👥 Nuovo server: ${guild.name} - ${guild.memberCount} membri`);
        
        // Log del proprietario del server
        if (guild.ownerId) {
            const owner = guild.members.cache.get(guild.ownerId);
            if (owner) {
                logger.info(`👑 Proprietario: ${owner.user.tag} (ID: ${owner.user.id})`);
            }
        }
    }
};
