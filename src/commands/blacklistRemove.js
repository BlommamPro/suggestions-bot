const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { pool } = require('../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('suggestion_blacklist_remove')
        .setDescription('Remueve un usuario de la lista negra de sugerencias')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .addUserOption(option => 
            option.setName('usuario')
                .setDescription('El usuario a desbloquear')
                .setRequired(true)
        ),
    async execute(interaction) {
        const usuario = interaction.options.getUser('usuario');
        
        try {
            const res = await pool.query('DELETE FROM blacklist WHERE usuario_id = $1', [usuario.id]);
            
            if (res.rowCount === 0) {
                return interaction.reply({ content: `⚠️ El usuario <@${usuario.id}> no estaba en la lista negra.`, flags: 64 });
            }
            
            await interaction.reply({ content: `✅ El usuario <@${usuario.id}> ha sido removido de la lista negra.`, flags: 64 });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Error al remover de la lista negra.', flags: 64 });
        }
    }
};