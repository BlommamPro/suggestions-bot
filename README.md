# 🤖 Discord Suggestion Bot (Multi-Servidor & Bilingüe)

Un bot de sugerencias profesional, modular y persistente para Discord, construido con **Discord.js v14**, **Node.js** y **PostgreSQL (Neon)**. 

Diseñado para gestionar ideas de la comunidad en **múltiples servidores** simultáneamente, con un sistema de votación visual, panel de administración, lista negra, sistema anti-crash y **soporte multi-idioma (Español e Inglés)** configurable por cada servidor.

## ✨ Características Principales

- **Multi-Servidor:** Cada servidor tiene su propia configuración de canal, idioma, sugerencias y lista negra. No se mezclan los datos entre comunidades.
- **Idioma por Servidor:** Los administradores pueden elegir si los embeds de su servidor se muestran en **Español** o **Inglés** usando el comando `/setup`. Los botones y textos se adaptan automáticamente.
- **Votación Persistente:** Los votos se guardan en PostgreSQL, no en memoria. Los botones siguen funcionando incluso si el bot se reinicia.
- **Sistema Anti-Doble Voto:** Un usuario solo puede votar una vez por sugerencia. Si cambia de opinión (de positivo a negativo), el voto anterior se elimina automáticamente.
- **Gestión de Estados:** Los administradores pueden Aceptar o Denegar sugerencias. El embed cambia de color (Verde/Rojo) y se bloquean los votos.
- **Lista Negra (Blacklist):** Los administradores pueden bloquear a usuarios para que no puedan publicar más sugerencias en su servidor.
- **Sistema Anti-Crash:** Cualquier error inesperado del bot es capturado y enviado a un canal de Discord mediante Webhooks, evitando que el bot se apague sin dejar rastro.
- **Diseño Premium:** Embeds modernos con barras de progreso visuales (porcentajes) y bloques de código para el texto de la sugerencia.

## 🛠️ Tecnologías Utilizadas

- [Node.js](https://nodejs.org/) (v18 o superior)
- [Discord.js v14](https://discord.js.org/)
- [PostgreSQL](https://www.postgresql.org/) (Recomendado: [Neon.tech](https://neon.tech/))
- [pnpm](https://pnpm.io/) (Gestor de paquetes)

---

## ⚠️ Requisitos Previos en Discord (MUY IMPORTANTE)

Antes de invitar el bot o encenderlo, debes configurar correctamente tu aplicación en el [Discord Developer Portal](https://discord.com/developers/applications):

### 1. Privileged Gateway Intents (Pestaña "Bot")
Ve a la sección **Bot** y baja hasta **Privileged Gateway Intents**. Debes activar **obligatoriamente**:

- 🟢 **Message Content Intent:** **ACTIVADO (ON).** Es necesario para que el bot pueda procesar correctamente las interacciones de los modales y comandos.
- ⚪ **Server Members Intent:** **APAGADO (OFF).** El bot no lo necesita.
- ⚪ **Presence Intent:** **APAGADO (OFF).** El bot no lo necesita.

### 2. Permisos del Bot (Enlace de Invitación)
Para invitar el bot a un servidor, genera un enlace en **OAuth2 > URL Generator** con los siguientes parámetros:

**Scopes:**
- `bot`
- `applications.commands`

**Bot Permissions (Solo estos 4):**
- ✅ **Ver Canales** (View Channels)
- ✅ **Enviar Mensajes** (Send Messages)
- ✅ **Insertar Enlaces** (Embed Links)
- ✅ **Leer el Historial de Mensajes** (Read Message History)

> **Nota:** No necesitas darle permisos de Administrador. Con esos 4 permisos es más que suficiente y seguro.

---

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio e instalar dependencias

Abre tu terminal y ejecuta:

    git clone https://github.com/BlommamPro/suggestions-bot.git
    cd suggestions-bot
    pnpm install

### 2. Crear el Webhook para los Logs (Anti-Crash)

1. Ve al canal de Discord donde quieras recibir los errores (ej. `#logs-errores`).
2. Haz clic derecho en el canal > **Editar canal** > **Integraciones** > **Webhooks** > **Nuevo Webhook**.
3. Ponle un nombre (ej. "Error Logger") y copia la **URL del Webhook**.

### 3. Configurar el archivo .env

Crea un archivo llamado `.env` en la raíz del proyecto (puedes guiarte del `.env.example` actualizado) y agrega las siguientes variables:

    TOKEN=tu_token_secreto
    CLIENT_ID=id_de_tu_aplicacion
    DATABASE_URL=postgresql://usuario:password@ep-xxx.neon.tech/neondb?sslmode=verify-full&channel_binding=require
    WEBHOOK_LOGS=https://discord.com/api/webhooks/TU_ID/TU_TOKEN

> **Nota:** Las variables `GUILD_ID` y `CANAL_SUGERENCIAS` ya **no son necesarias**. El bot ahora es global y cada servidor configura su canal con el comando `/setup`.

### 4. Configurar la Base de Datos

El bot creará las tablas automáticamente al iniciar por primera vez. Sin embargo, si deseas crearlas manualmente, ejecuta este SQL en tu base de datos:

    CREATE TABLE IF NOT EXISTS configuracion (
        guild_id VARCHAR(50) PRIMARY KEY,
        canal_sugerencias VARCHAR(50) NOT NULL,
        idioma VARCHAR(5) DEFAULT 'es'
    );

    CREATE TABLE IF NOT EXISTS sugerencias (
        id VARCHAR(50) PRIMARY KEY,
        guild_id VARCHAR(50) NOT NULL,
        autor_id VARCHAR(50) NOT NULL,
        contenido TEXT NOT NULL,
        votos_positivos INT DEFAULT 0,
        votos_negativos INT DEFAULT 0,
        estado VARCHAR(20) DEFAULT 'pendiente',
        mensaje_id VARCHAR(50),
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS votos (
        sugerencia_id VARCHAR(50) REFERENCES sugerencias(id) ON DELETE CASCADE,
        usuario_id VARCHAR(50) NOT NULL,
        tipo_voto VARCHAR(10) NOT NULL CHECK (tipo_voto IN ('positivo', 'negativo')),
        PRIMARY KEY (sugerencia_id, usuario_id)
    );

    CREATE TABLE IF NOT EXISTS blacklist (
        guild_id VARCHAR(50) NOT NULL,
        usuario_id VARCHAR(50) NOT NULL,
        razon TEXT,
        agregado_por VARCHAR(50),
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (guild_id, usuario_id)
    );

### 5. Desplegar los Comandos Slash

Antes de iniciar el bot, debes registrar los comandos en Discord (esto los hará globales):

    pnpm run deploy

> **Nota:** Los comandos globales pueden tardar hasta 1 hora en aparecer. Si tienes prisa, puedes registrarlos en un servidor específico temporalmente añadiendo `GUILD_ID` al `.env` y ejecutando el comando de nuevo.

### 6. Iniciar el Bot

Para desarrollo (se reinicia automáticamente al guardar cambios):

    pnpm run dev

Para producción:

    pnpm start

---

## 🎮 Comandos Disponibles

### Para Usuarios

| Comando | Descripción |
| :--- | :--- |
| `/sugerir` o `/suggest` | Abre un formulario para enviar una nueva idea al canal de sugerencias. |
| `/help` | Muestra la lista de comandos y el enlace a las políticas de privacidad. |

### Para Administradores (Requieren permisos de Administrador)

| Comando | Descripción |
| :--- | :--- |
| `/setup <canal> <idioma>` | Configura el canal de sugerencias y el idioma (es/en) para el servidor. |
| `/suggestion_accept <id>` | Acepta una sugerencia. El mensaje se vuelve verde y se cierran las votaciones. |
| `/suggestion_deny <id> [razon]` | Deniega una sugerencia. El mensaje se vuelve rojo y se cierran las votaciones. |
| `/suggestion_blacklist_add <usuario>` | Bloquea a un usuario para que no pueda publicar sugerencias. |
| `/suggestion_blacklist_remove <usuario>` | Remueve a un usuario de la lista negra. |

---

## 📁 Estructura del Proyecto

    suggestions/
    ├── scripts/
    │   ├── deploy-commands.js   # Registra los comandos en Discord
    │   └── delete-commands.js   # Borra los comandos de Discord (útil para pruebas)
    ├── src/
    │   ├── commands/            # Comandos Slash (sugerir, aceptar, denegar, setup, help, blacklist)
    │   ├── database/            # Conexión y creación de tablas PostgreSQL
    │   ├── events/              # Manejo de eventos (ready, interactionCreate)
    │   ├── locales/             # Archivos de traducción (es.json, en.json)
    │   ├── utils/               # Funciones auxiliares (embedBuilder, i18n, antiCrash)
    │   └── index.js             # Punto de entrada del bot
    ├── .env                     # Variables de entorno (NO SUBIR A GITHUB)
    ├── .gitignore               # Archivos ignorados por Git
    ├── package.json             # Dependencias y scripts
    └── README.md                # Este archivo

---

## 🌍 ¿Cómo funciona el sistema Multi-Idioma?

El bot detecta el idioma configurado en la base de datos para cada servidor. 
- Si un administrador configura el servidor en **Español**, todos los embeds de sugerencias, botones y respuestas se mostrarán en español.
- Si lo configura en **Inglés**, se mostrarán en inglés.
- Los nombres de los comandos slash se adaptan automáticamente al idioma del cliente de cada usuario (ej. `/sugerir` para español, `/suggest` para inglés).

---

## 🛡️ Solución de Problemas (Troubleshooting)

- **Error `DiscordAPIError[10008]: Unknown Message`:** Ocurre si el bot intenta editar un mensaje que fue borrado. Asegúrate de usar el ID exacto que aparece en el pie del embed.
- **Error `DiscordAPIError[10062]: Unknown interaction`:** Ocurre si el bot tarda más de 3 segundos en responder a una interacción. Este bot ya incluye `deferReply` para evitarlo.
- **Los comandos no aparecen en Discord:** Si usaste `pnpm run deploy`, los comandos son globales y pueden tardar hasta 1 hora. Cierra y abre Discord para forzar la actualización.
- **Warning de SSL en PostgreSQL:** Asegúrate de que tu `DATABASE_URL` termine en `?sslmode=verify-full` para evitar advertencias de seguridad en la consola.
- **El bot no envía errores al Webhook:** Verifica que la URL en `WEBHOOK_LOGS` sea correcta y que el Webhook tenga permisos en el canal.

---

## 🚀 Recomendación para Producción (PM2)

Para que el bot se reinicie automáticamente si ocurre un error crítico (`uncaughtException`), se recomienda usar **PM2** en un VPS:

    pnpm add -g pm2
    pm2 start src/index.js --name "SuggestionBot"
    pm2 save
    pm2 startup

Con PM2 y el sistema Anti-Crash, tu bot será monitoreado 24/7 y recibirás cada error en tu canal de Discord. *(Nota: Si usas un hosting como Wispbyte, este ya incluye su propio sistema de reinicio, por lo que no necesitas PM2).*

---
