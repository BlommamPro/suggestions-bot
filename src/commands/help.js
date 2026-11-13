const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { t } = require('../utils/i18n');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Muestra la ayuda y políticas')
        .setDescriptionLocalizations({ 'en-US': 'Shows help and policies' }),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle(t(interaction, 'help_title'))
            .setDescription(t(interaction, 'help_desc'))
            .setColor('#5865F2')
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .addFields(
                { 
                    name: t(interaction, 'help_user_title'), 
                    value: '`/sugerir` - Envía una idea.\n`/help` - Este menú.\n`/ping` - Muestra la latencia del bot.',
                    inline: false
                },
                { 
                    name: t(interaction, 'help_admin_title'), 
                    value: '`/setup` - Configura el canal.\n`/suggestion_accept` - Acepta sugerencia.\n`/suggestion_deny` - Deniega sugerencia.\n`/suggestion_blacklist_add` - Bloquea usuario.\n`/suggestion_blacklist_remove` - Desbloquea.',
                    inline: false
                }
            )
            .setFooter({ text: t(interaction, 'help_footer'), iconURL: interaction.client.user.displayAvatarURL() })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel(t(interaction, 'help_btn_privacy'))
                .setURL('https://estrellastudios-dev.github.io/bots/suggestions/privacy.html')
                .setStyle(ButtonStyle.Link)
                .setEmoji('🔒')
        );

        await interaction.editReply({ embeds: [embed], components: [row] });
    }
};