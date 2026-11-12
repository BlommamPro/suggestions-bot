const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { pool } = require('../database/db');
const { crearEmbedSugerencia } = require('../utils/embedBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('suggestion_accept')
        .setDescription('Acepta una sugerencia')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .addStringOption(option => 
            option.setName('id')
                .setDescription('El ID de la sugerencia a aceptar')
                .setRequired(true)
        ),
    async execute(interaction) {
        const idSug = interaction.options.getString('id');
        await interaction.deferReply({ flags: 64 });

        try {
            const res = await pool.query("UPDATE sugerencias SET estado = 'aceptada' WHERE id = $1 RETURNING *", [idSug]);
            
            if (res.rows.length === 0) return interaction.editReply({ content: '❌ No se encontró esa sugerencia.' });

            const sugerencia = res.rows[0];
            const canal = interaction.client.channels.cache.get(process.env.CANAL_SUGERENCIAS);
            
            if (!sugerencia.mensaje_id) {
                return interaction.editReply({ content: '❌ Esta sugerencia es antigua y no tiene un ID de mensaje guardado. No se puede editar.' });
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
                'aceptada'
            );

            await mensaje.edit({ embeds: [embedNuevo], components: [] }); 
            await interaction.editReply({ content: `✅ Sugerencia **${idSug}** aceptada correctamente.` });

        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: '❌ Error al aceptar. Asegúrate de que el ID sea correcto y el mensaje aún exista.' });
        }
    }
};