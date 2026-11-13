const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { pool } = require('../database/db');
const { crearEmbedSugerencia } = require('../utils/embedBuilder');
const { t } = require('../utils/i18n');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('suggestion_deny')
        .setDescription('Deniega una sugerencia')
        .setDescriptionLocalizations({ 'en-US': 'Deny a suggestion' })
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .addStringOption(opt => opt.setName('id').setDescription('ID de la sugerencia').setDescriptionLocalizations({ 'en-US': 'Suggestion ID' }).setRequired(true))
        .addStringOption(opt => opt.setName('razon').setDescription('Razón').setDescriptionLocalizations({ 'en-US': 'Reason' }).setRequired(false)),
    async execute(interaction) {
        await interaction.deferReply({ flags: 64 });
        const idSug = interaction.options.getString('id');
        const razon = interaction.options.getString('razon') || 'No especificada';
        try {
            const res = await pool.query("UPDATE sugerencias SET estado = 'denegada' WHERE id = $1 AND guild_id = $2 RETURNING *", [idSug, interaction.guildId]);
            if (res.rows.length === 0) return interaction.editReply({ content: t(interaction, 'not_found') });
            
            const sug = res.rows[0];
            const config = await pool.query('SELECT canal_sugerencias, idioma FROM configuracion WHERE guild_id = $1', [interaction.guildId]);
            const idiomaServidor = config.rows[0].idioma || 'es';
            const canal = interaction.client.channels.cache.get(config.rows[0].canal_sugerencias);
            if (!sug.mensaje_id || !canal) return interaction.editReply({ content: t(interaction, 'not_found') });
            
            const mensaje = await canal.messages.fetch(sug.mensaje_id);
            const autor = await interaction.client.users.fetch(sug.autor_id).catch(() => null);
            
            const embed = crearEmbedSugerencia(interaction, sug.autor_id, autor?.username || 'Usuario', sug.contenido, idSug, sug.votos_positivos, sug.votos_negativos, autor?.displayAvatarURL() || interaction.client.user.displayAvatarURL(), idiomaServidor, 'denegada');
            
            embed.setFooter({ text: `ID: ${idSug} • ${idiomaServidor === 'es' ? 'Razón' : 'Reason'}: ${razon}` });
            
            await mensaje.edit({ embeds: [embed], components: [] });
            await interaction.editReply({ content: t(interaction, 'denied', idiomaServidor) });
        } catch (e) { console.error(e); await interaction.editReply({ content: '❌ Error' }); }
    }
};