const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { pool } = require('../database/db');
const { t } = require('../utils/i18n');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('suggestion_blacklist_add')
        .setDescription('Añade usuario a la lista negra')
        .setDescriptionLocalizations({ 'en-US': 'Add user to blacklist' })
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .addUserOption(opt => opt.setName('usuario').setDescription('Usuario').setDescriptionLocalizations({ 'en-US': 'User' }).setRequired(true)),
    async execute(interaction) {
        const user = interaction.options.getUser('usuario');
        try {
            await pool.query('INSERT INTO blacklist (guild_id, usuario_id, agregado_por) VALUES ($1, $2, $3) ON CONFLICT (guild_id, usuario_id) DO NOTHING', [interaction.guildId, user.id, interaction.user.id]);
            await interaction.reply({ content: `${t(interaction, 'blacklist_added')} (<@${user.id}>)`, flags: 64 });
        } catch (e) { console.error(e); await interaction.reply({ content: '❌ Error', flags: 64 }); }
    }
};