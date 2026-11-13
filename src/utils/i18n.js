const es = require('../locales/es.json');
const en = require('../locales/en.json');

const translations = { es, en };

function getLanguage(interaction, forzarIdioma = null) {
    if (forzarIdioma && translations[forzarIdioma]) return forzarIdioma;
    
    const userLocale = interaction.locale || 'es'; 
    if (userLocale.startsWith('en')) return 'en';
    return 'es';
}

function t(interaction, key, forzarIdioma = null) {
    const lang = getLanguage(interaction, forzarIdioma);
    return translations[lang][key] || translations['es'][key] || key;
}

module.exports = { t };