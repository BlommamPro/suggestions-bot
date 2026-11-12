const { initDB } = require('../database/db');

module.exports = {
    name: 'clientReady',
    once: true,
    async execute(client) {
        await initDB();
        console.log(`🤖 Bot conectado como ${client.user.tag}`);
        
        if (process.env.WEBHOOK_LOGS) {
            const { WebhookClient } = require('discord.js');
            const webhook = new WebhookClient({ url: process.env.WEBHOOK_LOGS });
            await webhook.send({ content: `🟢 **Bot encendido** como ${client.user.tag}` }).catch(() => {});
        }
    }
};