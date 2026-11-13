const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { pool } = require('../database/db');
const { t } = require('../utils/i18n');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('suggestion_blacklist_remove')
        .setDescription('Remueve usuario de la lista negra')
        .setDescriptionLocalizations({ 'en-US': 'Remove user from blacklist' })
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .addUserOption(opt => opt.setName('usuario').setDescription('Usuario').setDescriptionLocalizations({ 'en-US': 'User' }).setRequired(true)),
    async execute(interaction) {
        const user = interaction.options.getUser('usuario');
        try {
            const res = await pool.query('DELETE FROM blacklist WHERE guild_id = $1 AND usuario_id = $2', [interaction.guildId, user.id]);
            if (res.rowCount === 0) return interaction.editReply({ content: `${t(interaction, 'not_in_blacklist')} (<@${user.id}>)` });
            await interaction.editReply({ content: `${t(interaction, 'blacklist_removed')} (<@${user.id}>)` });
        } catch (e) { 
            console.error(e); 
            await interaction.editReply({ content: '<:cross:1570833592895016970> Error' }); 
        }
    }
};