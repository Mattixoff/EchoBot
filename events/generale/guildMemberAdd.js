const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const logger = require('../../utils/logger.js');
const config = require('../../config.js');

module.exports = {
    name: 'guildMemberAdd',
    category: 'Generale',
    enabled: true,
    once: false,
    
    async execute(member) {
        // Carica la configurazione dal database
        const database = member.client.database;
        const guildId = member.guild.id;
        const verificationConfig = await database.getVerificationConfig(guildId);
        
        // Controlla se il sistema di benvenuto è abilitato
        if (!config.features.welcome.enabled) return;
        
        // Controlla se è specificato un canale di benvenuto
        if (!config.features.welcome.channel) {
            logger.warn('Canale di benvenuto non configurato nel config.js');
            return;
        }
        
        try {
            const welcomeChannel = member.guild.channels.cache.get(config.features.welcome.channel);
            
            if (!welcomeChannel) {
                logger.error(`Canale di benvenuto non trovato: ${config.features.welcome.channel}`);
                return;
            }
            
            const totalMembers = member.guild.memberCount; // Conta tutti i membri attuali (incluso il nuovo)

            const welcomeEmbed = new EmbedBuilder()
                .setColor('Blue')
                .setAuthor({ name: member.user.username, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
                .setTitle('**Welcome** to **__Echo__**')
                .setDescription('Welcome to the **__Echo support discord server__**, here you can see all the **updates**, the current **status** and the **changelogs** of the bot. Visit these channels:\n\n> - <#1337524035520565390>\n> - <#1337524726804775024>\n> - <#1337767841591463957>')
                .setThumbnail('https://cdn.discordapp.com/attachments/1337528677709123747/1343224165158879244/ECHO6.png?ex=67bc7e7c&is=67bb2cfc&hm=de338572ae1151a26118ceadc58130f1874fe1459409c27f93cebbc5f052cbff&')
                .setFooter({ text: `You are the ${totalMembers}º member!` }) // Mostra il numero totale di membri
                .setTimestamp();

            // Crea i pulsanti di verifica se abilitati
            let components = [];
            if (verificationConfig && verificationConfig.enabled) {
                const verifyButton = new ButtonBuilder()
                    .setCustomId('verify_user')
                    .setLabel(verificationConfig.buttonText || 'Verifica')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji(verificationConfig.buttonEmoji || '✅');

                const row = new ActionRowBuilder().addComponents(verifyButton);
                components.push(row);
            }

            await welcomeChannel.send({ 
                content: `<@${member.user.id}>`, 
                embeds: [welcomeEmbed],
                components: components
            });
            
            logger.info(`👋 Messaggio di benvenuto inviato per ${member.user.tag} nel server ${member.guild.name}`);
            
        } catch (error) {
            logger.error(`Errore nell'invio del messaggio di benvenuto: ${error.message}`);
        }
    }
};
