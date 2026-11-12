require('dotenv').config();
const { REST, Routes } = require('discord.js');

const rest = new REST().setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('🗑️ Eliminando comandos slash...');
        if (process.env.GUILD_ID) {
            await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: [] },
            );
            console.log(`✅ Comandos eliminados del servidor ${process.env.GUILD_ID}.`);
        } else {
            await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: [] },
            );
            console.log('✅ Comandos globales eliminados.');
        }
    } catch (error) {
        console.error('❌ Error al eliminar:', error);
    }
})();