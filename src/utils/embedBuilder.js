const { EmbedBuilder } = require('discord.js');
const { t } = require('./i18n');

function crearEmbedSugerencia(interaction, autorId, nombreAutor, contenido, idSug, votosPos, votosNeg, avatarURL, idiomaServidor = 'es', estado = 'pendiente') {
    const totalVotos = votosPos + votosNeg;
    const porcPos = totalVotos === 0 ? 0 : Math.round((votosPos / totalVotos) * 100);
    const porcNeg = totalVotos === 0 ? 0 : Math.round((votosNeg / totalVotos) * 100);
    
    const barraPos = '🟩'.repeat(Math.round(porcPos / 10)) + '⬛'.repeat(10 - Math.round(porcPos / 10));
    const barraNeg = '🟥'.repeat(Math.round(porcNeg / 10)) + '⬛'.repeat(10 - Math.round(porcNeg / 10));
    
    const pregunta = t(interaction, 'embed_question', idiomaServidor);
    const textoFormateado = `**${pregunta}**\n\`\`\`\n${contenido}\n\`\`\``;
    const footerTexto = `ID: ${idSug} • ${t(interaction, 'embed_footer', idiomaServidor)}`;

    let titulo = `${t(interaction, 'embed_title_new', idiomaServidor)} | ${nombreAutor}`;
    let color = '#2b2d31';
    let estadoTexto = null;

    if (estado === 'aceptada') {
        titulo = `${t(interaction, 'embed_title_accepted', idiomaServidor)} | ${nombreAutor}`;
        color = '#57F287';
        estadoTexto = t(interaction, 'embed_status_accepted', idiomaServidor);
    } else if (estado === 'denegada') {
        titulo = `${t(interaction, 'embed_title_denied', idiomaServidor)} | ${nombreAutor}`;
        color = '#ED4245';
        estadoTexto = t(interaction, 'embed_status_denied', idiomaServidor);
    }

    const embed = new EmbedBuilder()
        .setTitle(titulo)
        .setThumbnail(avatarURL)
        .setDescription(textoFormateado)
        .setColor(color)
        .addFields(
            { name: t(interaction, 'embed_votes_yes', idiomaServidor), value: `${barraPos}\n**${votosPos}** ${idiomaServidor === 'es' ? 'votos' : 'votes'} (${porcPos}%)`, inline: true },
            { name: t(interaction, 'embed_votes_no', idiomaServidor), value: `${barraNeg}\n**${votosNeg}** ${idiomaServidor === 'es' ? 'votos' : 'votes'} (${porcNeg}%)`, inline: true },
            { name: '\u200b', value: `${t(interaction, 'embed_total_votes', idiomaServidor)} ${totalVotos}`, inline: false }
        )
        .setFooter({ text: footerTexto })
        .setTimestamp();

    if (estadoTexto) {
        embed.addFields({ name: t(interaction, 'embed_status', idiomaServidor), value: estadoTexto, inline: false });
    }

    return embed;
}

module.exports = { crearEmbedSugerencia };