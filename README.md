# 🤖 Discord Suggestion Bot

Un bot de sugerencias profesional, modular y persistente para Discord, construido con **Discord.js v14**, **Node.js** y **PostgreSQL (Neon)**.

Diseñado para gestionar ideas de la comunidad con un sistema de votación visual, panel de administración y lista negra, asegurando que los votos no se pierdan incluso si el bot se reinicia. Incluye un sistema **Anti-Crash** que reporta errores a un canal privado de Discord.

## ✨ Características

- **Votación Persistente:** Los votos se guardan en PostgreSQL, no en memoria. Los botones siguen funcionando tras reinicios.
- **Diseño Premium:** Embeds modernos con barras de progreso visuales (porcentajes) y bloques de código para el texto de la sugerencia.
- **Sistema Anti-Doble Voto:** Un usuario solo puede votar una vez por sugerencia. Si cambia de opinión (de positivo a negativo), el voto anterior se elimina automáticamente.
- **Gestión de Estados:** Los administradores pueden Aceptar o Denegar sugerencias. El embed cambia de color y se bloquean los votos.
- **Lista Negra (Blacklist):** Los administradores pueden bloquear a usuarios para que no puedan publicar más sugerencias.
- **Sistema Anti-Crash:** Cualquier error inesperado del bot es capturado y enviado a un canal de Discord mediante Webhooks, evitando que el bot se apague sin dejar rastro.
- **Arquitectura Modular:** Código separado en comandos, eventos, utilidades y base de datos para fácil mantenimiento.

## 🛠️ Tecnologías Utilizadas

- [Node.js](https://nodejs.org/) (v18 o superior)
- [Discord.js v14](https://discord.js.org/)
- [PostgreSQL](https://www.postgresql.org/) (Recomendado: [Neon.tech](https://neon.tech/))
- [pnpm](https://pnpm.io/) (Gestor de paquetes)

---

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio e instalar dependencias

Abre tu terminal y ejecuta:

    git clone https://github.com/TU_USUARIO/TU_REPOSITORIO.git
    cd TU_REPOSITORIO
    pnpm install

### 2. Crear el Webhook para los Logs (Anti-Crash)

1. Ve al canal de Discord donde quieras recibir los errores (ej. `#logs-errores`).
2. Haz clic derecho en el canal > **Editar canal** > **Integraciones** > **Webhooks** > **Nuevo Webhook**.
3. Ponle un nombre (ej. "Error Logger") y copia la **URL del Webhook**.

### 3. Configurar el archivo .env

Crea un archivo llamado `.env` en la raíz del proyecto y agrega las siguientes variables:

    TOKEN=tu_token_secreto
    CLIENT_ID=id_de_tu_aplicacion
    GUILD_ID=id_de_tu_servidor
    CANAL_SUGERENCIAS=id_del_canal
    DATABASE_URL=postgresql://usuario:password@ep-xxx.neon.tech/neondb?sslmode=verify-full&channel_binding=require
    WEBHOOK_LOGS=https://discord.com/api/webhooks/TU_ID/TU_TOKEN

### 4. Configurar la Base de Datos

El bot creará las tablas automáticamente al iniciar por primera vez. Sin embargo, si deseas crearlas manualmente, ejecuta este SQL en tu base de datos:

    CREATE TABLE IF NOT EXISTS sugerencias (
        id VARCHAR(50) PRIMARY KEY,
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
        usuario_id VARCHAR(50) PRIMARY KEY,
        razon TEXT,
        agregado_por VARCHAR(50),
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

### 5. Desplegar los Comandos Slash

Antes de iniciar el bot, debes registrar los comandos en Discord:

    pnpm run deploy

*(Si tienes el GUILD_ID configurado, aparecerán instantáneamente en ese servidor. Si no, tardarán hasta 1 hora en aparecer globalmente).*

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
| `/sugerir` | Abre un formulario para enviar una nueva idea al canal de sugerencias. |

### Para Administradores (Requieren permisos de Administrador)

| Comando | Descripción |
| :--- | :--- |
| `/suggestion_accept <id>` | Acepta una sugerencia. El mensaje se vuelve verde y se cierran las votaciones. |
| `/suggestion_deny <id> [razon]` | Deniega una sugerencia. El mensaje se vuelve rojo y se cierran las votaciones. |
| `/suggestion_blacklist_add <usuario> [razon]` | Bloquea a un usuario para que no pueda publicar sugerencias. |
| `/suggestion_blacklist_remove <usuario>` | Remueve a un usuario de la lista negra. |

---

## 📁 Estructura del Proyecto

    suggestions/
    ├── scripts/
    │   ├── deploy-commands.js   # Registra los comandos en Discord
    │   └── delete-commands.js   # Borra los comandos de Discord (útil para pruebas)
    ├── src/
    │   ├── commands/            # Comandos Slash (sugerir, aceptar, denegar, etc.)
    │   ├── database/            # Conexión y creación de tablas PostgreSQL
    │   ├── events/              # Manejo de eventos (ready, interactionCreate)
    │   ├── utils/               # Funciones auxiliares (crear Embed, Anti-Crash)
    │   └── index.js             # Punto de entrada del bot
    ├── .env                     # Variables de entorno (NO SUBIR A GITHUB)
    ├── .gitignore               # Archivos ignorados por Git
    ├── package.json             # Dependencias y scripts
    └── README.md                # Este archivo

---

## 🛡️ Solución de Problemas (Troubleshooting)

- **Error `DiscordAPIError[10008]: Unknown Message`:** Ocurre si el bot intenta editar un mensaje que fue borrado o si usas un `id` de sugerencia antiguo. Asegúrate de usar el ID exacto que aparece en el pie del embed.
- **Error `DiscordAPIError[10062]: Unknown interaction`:** Ocurre si el bot tarda más de 3 segundos en responder a una interacción. Este bot ya incluye `deferReply` en los modales para evitarlo. Si persiste, revisa la latencia de tu base de datos.
- **Los comandos no aparecen en Discord:** Si usaste `pnpm run deploy` sin `GUILD_ID`, los comandos son globales y pueden tardar hasta 1 hora. Para pruebas, configura el `GUILD_ID` en el `.env`.
- **Warning de SSL en PostgreSQL:** Asegúrate de que tu `DATABASE_URL` termine en `?sslmode=verify-full` para evitar advertencias de seguridad en la consola.
- **El bot no envía errores al Webhook:** Verifica que la URL en `WEBHOOK_LOGS` sea correcta y que el Webhook tenga permisos en el canal.

---

## 🚀 Recomendación para Producción (PM2)

Para que el bot se reinicie automáticamente si ocurre un error crítico (`uncaughtException`), se recomienda usar **PM2**:

    pnpm add -g pm2
    pm2 start src/index.js --name "SuggestionBot"
    pm2 save
    pm2 startup

Con PM2 y el sistema Anti-Crash, tu bot será monitoreado 24/7 y recibirás cada error en tu canal de Discord.

---
