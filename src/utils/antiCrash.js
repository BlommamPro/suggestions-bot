const { EmbedBuilder, WebhookClient } = require('discord.js');
require('dotenv').config();

const webhook = process.env.WEBHOOK_LOGS ? new WebhookClient({ url: process.env.WEBHOOK_LOGS }) : null;

async function enviarErrorAlCanal(error, tipo) {
    if (!webhook) return;
    const embed = new EmbedBuilder().setTitle(`🚨 Error: ${tipo}`).setDescription(`\`\`\`js\n${error.stack ? error.stack.slice(0, 4000) : error}\n\`\`\``).setColor('#ED4245').setTimestamp();
    try { await webhook.send({ embeds: [embed] }); } catch (e) { console.error('Error enviando webhook:', e); }
}

module.exports = (client) => {
    process.on('unhandledRejection', (reason) => { console.error('🚨 Unhandled Rejection:', reason); enviarErrorAlCanal(reason, 'Unhandled Rejection'); });
    process.on('uncaughtException', (error) => { console.error('🚨 Uncaught Exception:', error); enviarErrorAlCanal(error, 'Uncaught Exception'); });
    client.on('error', (error) => { console.error('🚨 Client Error:', error); enviarErrorAlCanal(error, 'Client Error'); });
    client.on('warn', (info) => console.warn('⚠️ Client Warning:', info));
};