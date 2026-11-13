const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { t } = require('../utils/i18n');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sugerir')
        .setNameLocalizations({ 'en-US': 'suggest' })
        .setDescription('Crea una nueva sugerencia para el servidor')
        .setDescriptionLocalizations({ 'en-US': 'Create a new suggestion for the server' }),
    async execute(interaction) {
        const modal = new ModalBuilder().setCustomId('modal_sugerencia').setTitle(t(interaction, 'modal_title'));
        const input = new TextInputBuilder()
            .setCustomId('input_sugerencia')
            .setLabel(t(interaction, 'modal_label'))
            .setPlaceholder(t(interaction, 'modal_placeholder'))
            .setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(1000);
        modal.addComponents(new ActionRowBuilder().addComponents(input));
        await interaction.showModal(modal);
    }
};