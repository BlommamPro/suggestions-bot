const { EmbedBuilder } = require('discord.js');
const { t } = require('./i18n');
const emojis = require('./emojis');

function crearBarra(porcentaje, tipo) {
    const bloquesLlenos = Math.round(porcentaje / 10); 
    
    const iniLleno = tipo === 'verde' ? emojis.verdeInicioLleno : emojis.rojoInicioLleno;
    const medLleno = tipo === 'verde' ? emojis.verdeMedioLleno : emojis.rojoMedioLleno;
    const finLleno = tipo === 'verde' ? emojis.verdeFinalLleno : emojis.rojoFinalLleno;
    
    const iniVacio = tipo === 'verde' ? emojis.verdeInicioVacio : emojis.rojoInicioVacio;
    const medVacio = tipo === 'verde' ? emojis.verdeMedioVacio : emojis.rojoMedioVacio;
    const finVacio = tipo === 'verde' ? emojis.verdeFinalVacio : emojis.rojoFinalVacio;

    let barra = '';

    for (let i = 0; i < 10; i++) {
        const esInicio = (i === 0);
        const esFinal = (i === 9);
        const esLleno = (i < bloquesLlenos);

        if (esInicio) {
            barra += esLleno ? iniLleno : iniVacio;
        } else if (esFinal) {
            barra += esLleno ? finLleno : finVacio;
        } else {
            barra += esLleno ? medLleno : medVacio;
        }
    }

    return barra;
}

function crearEmbedSugerencia(interaction, autorId, nombreAutor, contenido, idSug, votosPos, votosNeg, avatarURL, idiomaServidor = 'es', estado = 'pendiente') {
    const totalVotos = votosPos + votosNeg;
    const porcPos = totalVotos === 0 ? 0 : Math.round((votosPos / totalVotos) * 100);
    const porcNeg = totalVotos === 0 ? 0 : Math.round((votosNeg / totalVotos) * 100);
    
    const barraPos = crearBarra(porcPos, 'verde');
    const barraNeg = crearBarra(porcNeg, 'rojo');
    
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