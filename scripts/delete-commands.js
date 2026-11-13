require('dotenv').config();
const { REST, Routes } = require('discord.js');

const rest = new REST().setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('🗑️ Eliminando comandos globales...');
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: [] });
        console.log('✅ Comandos globales eliminados.');
    } catch (error) { console.error('❌ Error al eliminar:', error); }
})();