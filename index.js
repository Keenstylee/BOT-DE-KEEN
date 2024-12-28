/**
 * Este script es responsable
 * de las funciones que
 * se ejecutarán en el Lite Bot.
 *
 * Aquí es donde defines
 * lo que tu bot hará.
 *
 * @author Dev Gui
 */
const path = require("node:path");
const { menu } = require("./utils/menu");
const { ASSETS_DIR, BOT_NUMBER } = require("./config");
const { errorLog } = require("./utils/terminal");
const { attp, gpt4, playAudio, playVideo } = require("./services/spider-x-api");
const { consultarCep } = require("correios-brasil/dist");
const { image } = require("./services/hercai");

const {
  InvalidParameterError,
  WarningError,
  DangerError,
} = require("./errors");

const {
  checkPrefix,
  deleteTempFile,
  download,
  formatCommand,
  getBuffer,
  getContent,
  getJSON,
  getProfileImageData,
  getRandomName,
  getRandomNumber,
  isLink,
  loadLiteFunctions,
  onlyLettersAndNumbers,
  onlyNumbers,
  removeAccentsAndSpecialCharacters,
  splitByCharacters,
  toUserJid,
} = require("./utils/functions");

const {
  activateAntiLinkGroup,
  deactivateAntiLinkGroup,
  isActiveAntiLinkGroup,
  activateWelcomeGroup,
  isActiveGroup,
  deactivateWelcomeGroup,
  activateGroup,
  deactivateGroup,
  getUserLives,  // Nueva función para obtener vidas
  updateUserLives  // Nueva función para actualizar vidas
} = require("./database/db");

async function runLite({ socket, data }) {
  const functions = loadLiteFunctions({ socket, data });

  if (!functions) {
    return;
  }

  const {
    args,
    body,
    command,
    from,
    fullArgs,
    info,
    isImage,
    isReply,
    isSticker,
    isVideo,
    lite,
    prefix,
    replyJid,
    userJid,
    audioFromURL,
    ban,
    downloadImage,
    downloadSticker,
    downloadVideo,
    errorReact,
    errorReply,
    imageFromFile,
    imageFromURL,
    infoFromSticker,
    isAdmin,
    isOwner,
    react,
    recordState,
    reply,
    sendText,
    stickerFromFile,
    stickerFromURL,
    successReact,
    successReply,
    typingState,
    videoFromURL,
    waitReact,
    waitReply,
    warningReact,
    warningReply,
  } = functions;

  if (!isActiveGroup(from) && !(await isOwner(userJid))) {
    return;
  }

  if (!checkPrefix(prefix)) {
    if (body.toLowerCase().includes("gado")) {
      await reply("¡Eres el gadón guerrero!");
      return;
    }

    if (body === "salve") {
      await reply("¡Salve, salve!");
      return;
    }
  }

  if (
    !checkPrefix(prefix) &&
    isActiveAntiLinkGroup(from) &&
    isLink(body) &&
    !(await isAdmin(userJid))
  ) {
    await ban(from, userJid);
    await reply("¡Anti-link activado! ¡Fuiste removido por enviar un link!");
    return;
  }

  if (!checkPrefix(prefix)) {
    return;
  }

  try {
    switch (removeAccentsAndSpecialCharacters(command?.toLowerCase())) {
      case "ban":
      case "banir":
      case "kick":
        if (!(await isAdmin(userJid))) {
          throw new DangerError(
            "¡No tienes permiso para ejecutar este comando!"
          );
        }

        if (!args.length && !isReply) {
          throw new InvalidParameterError(
            "¡Necesitas mencionar o marcar un miembro!"
          );
        }

        const memberToRemoveJid = isReply ? replyJid : toUserJid(args[0]);
        const memberToRemoveNumber = onlyNumbers(memberToRemoveJid);

        if (
          memberToRemoveNumber.length < 7 ||
          memberToRemoveNumber.length > 15
        ) {
          throw new InvalidParameterError("¡Número inválido!");
        }

        if (memberToRemoveJid === userJid) {
          throw new DangerError("¡No puedes eliminarte a ti mismo!");
        }

        const botJid = toUserJid(BOT_NUMBER);

        if (memberToRemoveJid === botJid) {
          throw new DangerError("¡No puedes eliminarme!");
        }

        let lives = await getUserLives(memberToRemoveJid); // Obtener las vidas del usuario
        if (lives === null) {
          lives = 3; // Si el usuario no tiene un contador de vidas, asignamos 3
        }

        if (lives > 1) {
          await updateUserLives(memberToRemoveJid, lives - 1); // Reducir una vida
          await reply(`Te has portado mal, te quedan ${lives - 1} vidas. Si pierdes todas, serás eliminado.`);
        } else {
          await ban(from, memberToRemoveJid); // Eliminar al usuario cuando no queden vidas
          await updateUserLives(memberToRemoveJid, 0); // Eliminar las vidas
          await reply("¡Has sido eliminado por agotar tus vidas!");
        }

        await successReact();
        break;
      
      // Otros casos de comandos...
    }

  } catch (error) {
    if (error instanceof InvalidParameterError) {
      await warningReply(`¡Parámetros inválidos! ${error.message}`);
    } else if (error instanceof WarningError) {
      await warningReply(error.message);
    } else if (error instanceof DangerError) {
      await errorReply(error.message);
    } else {
      errorLog(`Error al ejecutar comando!\n\nDetalles: ${error.message}`);
      await errorReply(
        `Ocurrió un error al ejecutar el comando ${command.name}!\n\n📄 Detalles: ${error.message}`
      );
    }
  }
}
