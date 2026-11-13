const { InteractionType, ActionRowBuilder, ButtonBuilder, ButtonStyle, WebhookClient } = require('discord.js');
const { pool } = require('../database/db');
const { crearEmbedSugerencia } = require('../utils/embedBuilder');
const { t } = require('../utils/i18n');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;
            try { await command.execute(interaction); } 
            catch (error) {
                console.error(`Error en ${interaction.commandName}:`, error);
                if (process.env.WEBHOOK_LOGS) {
                    const webhook = new WebhookClient({ url: process.env.WEBHOOK_LOGS });
                    await webhook.send({ content: `🚨 Error en \`${interaction.commandName}\`: \`\`\`js\n${error.message}\n\`\`\`` }).catch(() => {});
                }
                if (!interaction.replied && !interaction.deferred) await interaction.reply({ content: '❌ Error', flags: 64 });
            }
        }

        if (interaction.type === InteractionType.ModalSubmit && interaction.customId === 'modal_sugerencia') {
            await interaction.deferReply({ flags: 64 }); 
            const guildId = interaction.guildId;
            try {
                const resConfig = await pool.query('SELECT canal_sugerencias, idioma FROM configuracion WHERE guild_id = $1', [guildId]);
                if (resConfig.rows.length === 0) return interaction.editReply({ content: t(interaction, 'no_setup') });
                
                const canalId = resConfig.rows[0].canal_sugerencias;
                const idiomaServidor = resConfig.rows[0].idioma || 'es';
                const canal = client.channels.cache.get(canalId);
                
                if (!canal) return interaction.editReply({ content: t(interaction, 'no_setup') });

                const resBlacklist = await pool.query('SELECT * FROM blacklist WHERE guild_id = $1 AND usuario_id = $2', [guildId, interaction.user.id]);
                if (resBlacklist.rows.length > 0) return interaction.editReply({ content: t(interaction, 'no_blacklist', idiomaServidor) });

                const contenido = interaction.fields.getTextInputValue('input_sugerencia');
                const idSug = Date.now().toString();
                await pool.query('INSERT INTO sugerencias (id, guild_id, autor_id, contenido, estado) VALUES ($1, $2, $3, $4, $5)', [idSug, guildId, interaction.user.id, contenido, 'pendiente']);

                const embed = crearEmbedSugerencia(interaction, interaction.user.id, interaction.user.username, contenido, idSug, 0, 0, interaction.user.displayAvatarURL(), idiomaServidor);
                
                const btnYes = idiomaServidor === 'es' ? 'Votar a favor' : 'Upvote';
                const btnNo = idiomaServidor === 'es' ? 'Votar en contra' : 'Downvote';

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId(`votar_positivo_${idSug}`).setLabel(btnYes).setEmoji('✅').setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId(`votar_negativo_${idSug}`).setLabel(btnNo).setEmoji('❌').setStyle(ButtonStyle.Danger)
                );
                const mensajeEnviado = await canal.send({ embeds: [embed], components: [row] });
                await pool.query('UPDATE sugerencias SET mensaje_id = $1 WHERE id = $2', [mensajeEnviado.id, idSug]);
                await interaction.editReply({ content: t(interaction, 'suggestion_success', idiomaServidor) });
            } catch (error) {
                console.error(error);
                if (interaction.deferred) await interaction.editReply({ content: t(interaction, 'error_db') });
            }
        }

        if (interaction.isButton() && interaction.customId.startsWith('votar_')) {
            const [, accion, idSug] = interaction.customId.split('_');
            const userId = interaction.user.id;
            try {
                const resConfig = await pool.query('SELECT idioma FROM configuracion WHERE guild_id = $1', [interaction.guildId]);
                const idiomaServidor = resConfig.rows.length > 0 ? resConfig.rows[0].idioma : 'es';

                const resSug = await pool.query('SELECT estado FROM sugerencias WHERE id = $1', [idSug]);
                if (resSug.rows.length === 0) return interaction.reply({ content: t(interaction, 'not_found', idiomaServidor), flags: 64 });
                if (resSug.rows[0].estado !== 'pendiente') return interaction.reply({ content: t(interaction, 'closed_suggestion', idiomaServidor), flags: 64 });

                const resVoto = await pool.query('SELECT tipo_voto FROM votos WHERE sugerencia_id = $1 AND usuario_id = $2', [idSug, userId]);
                const votoExistente = resVoto.rows[0];

                if (votoExistente) {
                    if (votoExistente.tipo_voto === accion) {
                        const msg = accion === 'positivo' ? t(interaction, 'already_voted_yes', idiomaServidor) : t(interaction, 'already_voted_no', idiomaServidor);
                        return interaction.reply({ content: msg, flags: 64 });
                    }
                    await pool.query('UPDATE votos SET tipo_voto = $1 WHERE sugerencia_id = $2 AND usuario_id = $3', [accion, idSug, userId]);
                    const ajusteViejo = votoExistente.tipo_voto === 'positivo' ? 'votos_positivos = votos_positivos - 1' : 'votos_negativos = votos_negativos - 1';
                    const ajusteNuevo = accion === 'positivo' ? 'votos_positivos = votos_positivos + 1' : 'votos_negativos = votos_negativos + 1';
                    await pool.query(`UPDATE sugerencias SET ${ajusteViejo}, ${ajusteNuevo} WHERE id = $1`, [idSug]);
                } else {
                    await pool.query('INSERT INTO votos (sugerencia_id, usuario_id, tipo_voto) VALUES ($1, $2, $3)', [idSug, userId, accion]);
                    const columna = accion === 'positivo' ? 'votos_positivos' : 'votos_negativos';
                    await pool.query(`UPDATE sugerencias SET ${columna} = ${columna} + 1 WHERE id = $1`, [idSug]);
                }

                const resFinal = await pool.query('SELECT autor_id, contenido, votos_positivos, votos_negativos FROM sugerencias WHERE id = $1', [idSug]);
                const { autor_id, contenido, votos_positivos, votos_negativos } = resFinal.rows[0];
                const autorUser = await client.users.fetch(autor_id).catch(() => null);
                
                const embedNuevo = crearEmbedSugerencia(interaction, autor_id, autorUser?.username || 'Usuario', contenido, idSug, votos_positivos, votos_negativos, autorUser?.displayAvatarURL() || client.user.displayAvatarURL(), idiomaServidor);
                await interaction.update({ embeds: [embedNuevo] });
                const confirmMsg = accion === 'positivo' ? t(interaction, 'vote_yes', idiomaServidor) : t(interaction, 'vote_no', idiomaServidor);
                await interaction.followUp({ content: confirmMsg, flags: 64 });
            } catch (error) {
                console.error(error);
                if (!interaction.replied && !interaction.deferred) await interaction.reply({ content: '❌ Error', flags: 64 });
            }
        }
    }
};