/**
 * Función de bienvenida personalizada con una pregunta.
 *
 * @autor Adaptado para Keen Bot
 */

const { getProfileImageData, onlyNumbers } = require("./utils/functions");
const { isActiveWelcomeGroup } = require("./database/db");
const { warningLog } = require("./utils/terminal");

async function welcome({ socket: lite, data }) {
  const from = data.id; // ID del grupo
  const userJid = data.participants[0]; // Número del participante

  // Esta línea ahora asegura que siempre se sale de la función y no se hace nada
  return;

  // Si decides mantener el control de las bienvenidas y eliminarlas en la base de datos:
  // if (!isActiveWelcomeGroup(from)) {
  //   return;
  // }

  // Si decides eliminar la acción de bienvenida completamente, el código no hará nada.
  // El código para enviar el mensaje de bienvenida ha sido eliminado.

  /*
  if (data.action === "add") {
    try {
      // Obtén la imagen de perfil del participante
      const { buffer } = await getProfileImageData(userJid, lite);

      // Mensaje de bienvenida con pregunta
      const welcomeMessage = `🎉 ¡Bienvenido(a) a *RaveUnity Perú 🇵🇪*, @${onlyNumbers(userJid)}! 🎶\n\n¿Qué evento planeas asistir y desde dónde te unes?`;

      // Envía la imagen de perfil y el mensaje
      await lite.sendMessage(from, {
        image: buffer,
        caption: welcomeMessage,
        mentions: [userJid],
      });
    } catch (error) {
      warningLog(
        "Alguien se unió al grupo, pero no pude enviar el mensaje de bienvenida."
      );
    }
  }
  */
}

module.exports = { welcome };


