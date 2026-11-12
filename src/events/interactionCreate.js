const { InteractionType, ActionRowBuilder, ButtonBuilder, ButtonStyle, WebhookClient } = require('discord.js');
const { pool } = require('../database/db');
const { crearEmbedSugerencia } = require('../utils/embedBuilder');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;
            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(`Error ejecutando comando ${interaction.commandName}:`, error);
                
                if (process.env.WEBHOOK_LOGS) {
                    const webhook = new WebhookClient({ url: process.env.WEBHOOK_LOGS });
                    await webhook.send({ 
                        content: `🚨 **Error en comando \`${interaction.commandName}\` (Usuario: ${interaction.user.tag}):**\n\`\`\`js\n${error.stack ? error.stack.slice(0, 1500) : error.message}\n\`\`\`` 
                    }).catch(() => {});
                }

                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({ content: '❌ Hubo un error ejecutando este comando.', flags: 64 });
                }
            }
        }

        if (interaction.type === InteractionType.ModalSubmit && interaction.customId === 'modal_sugerencia') {
            
            await interaction.deferReply({ flags: 64 }); 

            try {
                const resBlacklist = await pool.query('SELECT * FROM blacklist WHERE usuario_id = $1', [interaction.user.id]);
                if (resBlacklist.rows.length > 0) {
                    return interaction.editReply({ content: '❌ Estás en la lista negra y no puedes publicar sugerencias.' });
                }
            } catch (error) {
                console.error('Error verificando blacklist:', error);
                return interaction.editReply({ content: '❌ Error al verificar tu estado en la lista negra.' });
            }

            const contenido = interaction.fields.getTextInputValue('input_sugerencia');
            const canal = client.channels.cache.get(process.env.CANAL_SUGERENCIAS);
            
            if (!canal) {
                return interaction.editReply({ content: '❌ Canal de sugerencias no configurado correctamente.' });
            }

            const idSug = Date.now().toString();

            try {
                await pool.query(
                    'INSERT INTO sugerencias (id, autor_id, contenido, estado) VALUES ($1, $2, $3, $4)',
                    [idSug, interaction.user.id, contenido, 'pendiente']
                );

                const embed = crearEmbedSugerencia(
                    interaction.user.id, 
                    interaction.user.username, 
                    contenido, 
                    idSug, 
                    0, 
                    0, 
                    interaction.user.displayAvatarURL()
                );

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId(`votar_positivo_${idSug}`).setLabel('Votar a favor').setEmoji('✅').setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId(`votar_negativo_${idSug}`).setLabel('Votar en contra').setEmoji('❌').setStyle(ButtonStyle.Danger)
                );

                const mensajeEnviado = await canal.send({ embeds: [embed], components: [row] });
                
                await pool.query(
                    'UPDATE sugerencias SET mensaje_id = $1 WHERE id = $2',
                    [mensajeEnviado.id, idSug]
                );

                await interaction.editReply({ content: '✅ ¡Sugerencia publicada con éxito!' });
                
            } catch (error) {
                console.error('Error al publicar sugerencia:', error);
                if (interaction.deferred || interaction.replied) {
                    await interaction.editReply({ content: '❌ Error al guardar la sugerencia en la base de datos.' });
                }
            }
        }

        if (interaction.isButton()) {
            const partes = interaction.customId.split('_');
            if (partes[0] !== 'votar') return;

            const accion = partes[1]; 
            const idSug = partes[2];
            const userId = interaction.user.id;

            try {
                const resSug = await pool.query('SELECT estado FROM sugerencias WHERE id = $1', [idSug]);
                
                if (resSug.rows.length === 0) {
                    return interaction.reply({ content: '❌ Esta sugerencia no existe en la base de datos.', flags: 64 });
                }

                const estadoActual = resSug.rows[0].estado;
                if (estadoActual === 'aceptada' || estadoActual === 'denegada') {
                    return interaction.reply({ 
                        content: `⚠️ Esta sugerencia ya fue **${estadoActual.toUpperCase()}** y las votaciones están cerradas.`, 
                        flags: 64 
                    });
                }

                const resVoto = await pool.query('SELECT tipo_voto FROM votos WHERE sugerencia_id = $1 AND usuario_id = $2', [idSug, userId]);
                const votoExistente = resVoto.rows[0];

                if (votoExistente) {
                    if (votoExistente.tipo_voto === accion) {
                        return interaction.reply({ content: `⚠️ Ya has votado **${accion}** en esta sugerencia.`, flags: 64 });
                    }

                    await pool.query(
                        'UPDATE votos SET tipo_voto = $1 WHERE sugerencia_id = $2 AND usuario_id = $3', 
                        [accion, idSug, userId]
                    );
                    
                    const ajusteViejo = votoExistente.tipo_voto === 'positivo' ? 'votos_positivos = votos_positivos - 1' : 'votos_negativos = votos_negativos - 1';
                    const ajusteNuevo = accion === 'positivo' ? 'votos_positivos = votos_positivos + 1' : 'votos_negativos = votos_negativos + 1';
                    
                    await pool.query(`UPDATE sugerencias SET ${ajusteViejo}, ${ajusteNuevo} WHERE id = $1`, [idSug]);
                    
                } else {
                    await pool.query(
                        'INSERT INTO votos (sugerencia_id, usuario_id, tipo_voto) VALUES ($1, $2, $3)', 
                        [idSug, userId, accion]
                    );
                    
                    const columna = accion === 'positivo' ? 'votos_positivos' : 'votos_negativos';
                    await pool.query(`UPDATE sugerencias SET ${columna} = ${columna} + 1 WHERE id = $1`, [idSug]);
                }

                const resFinal = await pool.query('SELECT autor_id, contenido, votos_positivos, votos_negativos FROM sugerencias WHERE id = $1', [idSug]);
                const { autor_id, contenido, votos_positivos, votos_negativos } = resFinal.rows[0];

                const autorUser = await client.users.fetch(autor_id).catch(() => null);
                const nombreAutor = autorUser ? autorUser.username : 'Usuario Desconocido';
                const autorAvatar = autorUser ? autorUser.displayAvatarURL() : client.user.displayAvatarURL();

                const embedNuevo = crearEmbedSugerencia(
                    autor_id, 
                    nombreAutor, 
                    contenido, 
                    idSug, 
                    votos_positivos, 
                    votos_negativos, 
                    autorAvatar
                );

                await interaction.update({ embeds: [embedNuevo] });
                await interaction.followUp({ content: `✅ Voto registrado como **${accion}**.`, flags: 64 });

            } catch (error) {
                console.error('Error en el sistema de votos:', error);
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({ content: '❌ Hubo un error al procesar tu voto.', flags: 64 });
                }
            }
        }
    }
};