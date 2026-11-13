const { SlashCommandBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const { pool } = require('../database/db');
const { t } = require('../utils/i18n');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Configura el canal y el idioma de las sugerencias')
        .setDescriptionLocalizations({ 'en-US': 'Configure the channel and language for suggestions' })
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .addChannelOption(opt => opt.setName('canal').setDescription('Canal donde se enviarán las sugerencias').setDescriptionLocalizations({ 'en-US': 'Channel where suggestions will be sent' }).addChannelTypes(ChannelType.GuildText).setRequired(true))
        .addStringOption(opt => opt.setName('idioma').setDescription('Idioma de los embeds de sugerencias').setDescriptionLocalizations({ 'en-US': 'Language for the suggestion embeds' }).setRequired(true)
            .addChoices(
                { name: 'Español', value: 'es' },
                { name: 'English', value: 'en' }
            )),
    async execute(interaction) {
        const canalId = interaction.options.getChannel('canal').id;
        const idioma = interaction.options.getString('idioma');
        
        try {
            await pool.query(
                'INSERT INTO configuracion (guild_id, canal_sugerencias, idioma) VALUES ($1, $2, $3) ON CONFLICT (guild_id) DO UPDATE SET canal_sugerencias = $2, idioma = $3', 
                [interaction.guildId, canalId, idioma]
            );
            
            const mensajeExito = idioma === 'es' 
                ? `<:check:1570833514142761060> Canal configurado en <#${canalId}> con idioma **Español**.`
                : `<:check:1570833514142761060> Channel configured in <#${canalId}> with **English** language.`;
                
            await interaction.editReply({ content: mensajeExito });
        } catch (e) { 
            console.error(e); 
            await interaction.editReply({ content: '❌ Error' }); 
        }
    }
};