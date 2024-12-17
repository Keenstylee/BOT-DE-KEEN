/**
 * Menú del bot
 *
 * @autor Adaptado para Keen Bot
 */

const { BOT_NAME, PREFIX } = require("../config");

exports.menu = () => {
  const date = new Date();

  return `🌟 Holaaa, soy ${BOT_NAME} que quieres causa? 🌟

📅 Fecha: ${date.toLocaleDateString("es-PE")}
⏰ Hora: ${date.toLocaleTimeString("es-PE")}
🔑 Prefijo: Usa "${PREFIX}" antes de cada comando.

🚀 **Comandos Rápidos**

🎨 **Comandos Generales (Para Todos)**
  ✔️ ${PREFIX}attp - Crea texto animado.
  ✔️ ${PREFIX}cep - Busca información de una dirección.
  ✔️ ${PREFIX}ravito - Consulta a GPT-4.
  ✔️ ${PREFIX}image - Genera imágenes con IA.
  ✔️ ${PREFIX}ping - Verifica la conexión del bot.
  ✔️ ${PREFIX}play-audio - Descarga y reproduce audios.
  ✔️ ${PREFIX}play-video - Descarga y reproduce videos.
  • ${PREFIX}sticker - Convierte imágenes en stickers.
s
🎛 **Dueño del Bot**
  ✔️ ${PREFIX}off - Apagar el bot.
  ✔️ ${PREFIX}on - Encender el bot.

🔧 **Administradores**
  ✔️ ${PREFIX}anti-link (1/0) - Activa o desactiva el anti-links.
  ✔️ ${PREFIX}ban - Expulsa a un miembro.
  ✔️ ${PREFIX}somosfme - Menciona a todos en silencio.
  ✔️ ${PREFIX}welcome (1/0) - Activa o desactiva las bienvenidas.`;
};
