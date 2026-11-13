const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const PROPIETARIOS = ['536717287567392768'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Muestra las estadísticas del bot (Solo dueño)')
        .setDescriptionLocalizations({ 'en-US': 'Shows bot stats (Owner only)' })
        .setDefaultMemberPermissions(0),
    async execute(interaction) {
        if (!PROPIETARIOS.includes(interaction.user.id)) {
            return interaction.editReply({ content: '<:cross:1570833592895016970> No tienes permiso para usar este comando.' });
        }

        const client = interaction.client;
        const servidores = client.guilds.cache.size;
        const usuarios = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        const canales = client.channels.cache.size;

        const uptime = client.uptime;
        const dias = Math.floor(uptime / 86400000);
        const horas = Math.floor(uptime / 3600000) % 24;
        const minutos = Math.floor(uptime / 60000) % 60;
        const segundos = Math.floor(uptime / 1000) % 60;

        const embed = new EmbedBuilder()
            .setTitle('📊 Estadísticas del Bot')
            .setColor('#5865F2')
            .setThumbnail(client.user.displayAvatarURL())
            .addFields(
                { name: '🌐 Servidores', value: `\`${servidores}\``, inline: true },
                { name: '👥 Usuarios (Aprox.)', value: `\`${usuarios}\``, inline: true },
                { name: '💬 Canales', value: `\`${canales}\``, inline: true },
                { name: '⏱️ Tiempo Activo', value: `\`${dias}d ${horas}h ${minutos}m ${segundos}s\``, inline: false }
            )
            .setFooter({ text: `ID del Bot: ${client.user.id}` })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};