const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { pool } = require('../database/db');
const { crearEmbedSugerencia } = require('../utils/embedBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('suggestion_deny')
        .setDescription('Deniega una sugerencia')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .addStringOption(option => 
            option.setName('id')
                .setDescription('El ID de la sugerencia')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('razon')
                .setDescription('Motivo de la denegación (opcional)')
                .setRequired(false)
        ),
    async execute(interaction) {
        const idSug = interaction.options.getString('id');
        const razon = interaction.options.getString('razon') || 'No especificada';
        await interaction.deferReply({ flags: 64 });

        try {
            const res = await pool.query("UPDATE sugerencias SET estado = 'denegada' WHERE id = $1 RETURNING *", [idSug]);
            
            if (res.rows.length === 0) return interaction.editReply({ content: '❌ No se encontró esa sugerencia.' });

            const sugerencia = res.rows[0];
            const canal = interaction.client.channels.cache.get(process.env.CANAL_SUGERENCIAS);
            
            if (!sugerencia.mensaje_id) {
                return interaction.editReply({ content: '❌ Esta sugerencia es antigua y no tiene un ID de mensaje guardado.' });
            }

            const mensaje = await canal.messages.fetch(sugerencia.mensaje_id);

            const autorUser = await interaction.client.users.fetch(sugerencia.autor_id).catch(() => null);
            const nombreAutor = autorUser ? autorUser.username : 'Usuario Desconocido';
            const autorAvatar = autorUser ? autorUser.displayAvatarURL() : interaction.client.user.displayAvatarURL();

            const embedNuevo = crearEmbedSugerencia(
                sugerencia.autor_id, 
                nombreAutor, 
                sugerencia.contenido, 
                idSug, 
                sugerencia.votos_positivos, 
                sugerencia.votos_negativos, 
                autorAvatar,
                'denegada'
            );

            embedNuevo.setFooter({ text: `ID: ${idSug} • Razón: ${razon}`, iconURL: autorAvatar });

            await mensaje.edit({ embeds: [embedNuevo], components: [] });
            await interaction.editReply({ content: `❌ Sugerencia **${idSug}** denegada.` });

        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: '❌ Error al denegar. Verifica el ID.' });
        }
    }
};