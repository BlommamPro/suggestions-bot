const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Muestra la ayuda y políticas')
        .setDescriptionLocalizations({ 'en-US': 'Shows help and policies' }),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('📚 Ayuda - Suggestion Bot')
            .setDescription('Aquí tienes los comandos disponibles.')
            .setColor('#5865F2')
            .addFields(
                { name: '👤 Usuarios', value: '`/sugerir` - Envía una idea.\n`/help` - Este menú.' },
                { name: '🛡️ Administradores', value: '`/setup` - Configura el canal.\n`/suggestion_accept` - Acepta sugerencia.\n`/suggestion_deny` - Deniega sugerencia.\n`/suggestion_blacklist_add` - Bloquea usuario.\n`/suggestion_blacklist_remove` - Desbloquea.' }
            ).setFooter({ text: 'Suggestion Bot' }).setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setLabel('Políticas de Privacidad').setURL('https://estrellastudios-dev.github.io/bots/suggestions/privacy.html').setStyle(ButtonStyle.Link).setEmoji('🔒')
        );

        await interaction.reply({ embeds: [embed], components: [row], flags: 64 });
    }
};