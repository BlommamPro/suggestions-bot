const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { pool } = require('../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('suggestion_blacklist_add')
        .setDescription('Añade un usuario a la lista negra de sugerencias')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .addUserOption(option => 
            option.setName('usuario')
                .setDescription('El usuario a bloquear')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('razon')
                .setDescription('Motivo del bloqueo')
                .setRequired(false)
        ),
    async execute(interaction) {
        const usuario = interaction.options.getUser('usuario');
        const razon = interaction.options.getString('razon') || 'No especificada';
        
        try {
            await pool.query(
                'INSERT INTO blacklist (usuario_id, razon, agregado_por) VALUES ($1, $2, $3) ON CONFLICT (usuario_id) DO UPDATE SET razon = $2, agregado_por = $3',
                [usuario.id, razon, interaction.user.id]
            );
            await interaction.reply({ content: `✅ El usuario <@${usuario.id}> ha sido añadido a la lista negra.`, flags: 64 });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Error al añadir a la lista negra.', flags: 64 });
        }
    }
};