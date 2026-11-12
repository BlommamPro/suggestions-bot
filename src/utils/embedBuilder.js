const { EmbedBuilder } = require('discord.js');

function crearEmbedSugerencia(autorId, nombreAutor, contenido, idSug, votosPos, votosNeg, avatarURL, estado = 'pendiente') {
    
    const totalVotos = votosPos + votosNeg;
    
    const porcPos = totalVotos === 0 ? 0 : Math.round((votosPos / totalVotos) * 100);
    const porcNeg = totalVotos === 0 ? 0 : Math.round((votosNeg / totalVotos) * 100);

    const barraPos = '🟩'.repeat(Math.round(porcPos / 10)) + '⬛'.repeat(10 - Math.round(porcPos / 10));
    const barraNeg = '🟥'.repeat(Math.round(porcNeg / 10)) + '⬛'.repeat(10 - Math.round(porcNeg / 10));

    const textoFormateado = `**¿Cuál es tu sugerencia?**\n\`\`\`\n${contenido}\n\`\`\``;

    const embed = new EmbedBuilder()
        .setTitle(`📨 NUEVA SUGERENCIA RECIBIDA | ${nombreAutor}`)
        .setThumbnail(avatarURL)
        .setDescription(textoFormateado)
        .setColor('#2b2d31')
        .addFields(
            { 
                name: '✅ A Favor', 
                value: `${barraPos}\n**${votosPos}** votos (${porcPos}%)`, 
                inline: true 
            },
            { 
                name: '❌ En Contra', 
                value: `${barraNeg}\n**${votosNeg}** votos (${porcNeg}%)`, 
                inline: true 
            },
            { 
                name: '\u200b', 
                value: `**Total de votos:** ${totalVotos}`, 
                inline: false 
            }
        )
        .setFooter({ text: `ID: ${idSug} • Sistema de Sugerencias` })
        .setTimestamp();

    if (estado === 'aceptada') {
        embed.setColor('#57F287')
             .setTitle(`📨 SUGERENCIA ACEPTADA | ${nombreAutor}`)
             .addFields({ name: '📌 Estado', value: '**Esta sugerencia ha sido ACEPTADA por el staff.**', inline: false });
    } else if (estado === 'denegada') {
        embed.setColor('#ED4245')
             .setTitle(`📨 SUGERENCIA DENEGADA | ${nombreAutor}`)
             .addFields({ name: '📌 Estado', value: '**Esta sugerencia ha sido DENEGADA por el staff.**', inline: false });
    }

    return embed;
}

module.exports = { crearEmbedSugerencia };