const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { pool } = require('../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Muestra la latencia del bot')
        .setDescriptionLocalizations({ 'en-US': 'Shows the bot latency' }),
    async execute(interaction) {
        const startDB = Date.now();
        await pool.query('SELECT 1');
        const dbPing = Date.now() - startDB;

        const wsPing = interaction.client.ws.ping;

        const embed = new EmbedBuilder()
            .setTitle('🏓 Pong!')
            .setColor('#57F287')
            .addFields(
                { name: '📡 Latencia de Discord (WebSocket)', value: `\`${wsPing}ms\``, inline: true },
                { name: '🗄️ Latencia de la Base de Datos', value: `\`${dbPing}ms\``, inline: true }
            )
            .setFooter({ text: `Solicitado por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed], flags: 64 });
    }
};