const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sugerir')
        .setDescription('Crea una nueva sugerencia para el servidor'),
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('modal_sugerencia')
            .setTitle('Publica tu sugerencia');

        const inputSugerencia = new TextInputBuilder()
            .setCustomId('input_sugerencia')
            .setLabel('Explica detalladamente cuál es tu sugerencia')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(1000);

        modal.addComponents(new ActionRowBuilder().addComponents(inputSugerencia));
        await interaction.showModal(modal);
    }
};