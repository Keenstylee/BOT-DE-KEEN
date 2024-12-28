/**
 * Este script es responsable
 * de las funciones que
 * se ejecutarán
 * en el Lite Bot.
 *
 * Aquí es donde vas a definir
 * lo que tu bot
 * hará.
 *
 * @autor Dev Gui
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
    /**
     * ⏩ Un auto responder simple ⏪
     *
     * Si el mensaje incluye la palabra
     * (ignora mayúsculas y minúsculas) usa:
     * body.toLowerCase().includes("palabra")
     *
     * Si el mensaje es exactamente igual a
     * la palabra (ignora mayúsculas y minúsculas) usa:
     * body.toLowerCase() === "palabra"
     */
    if (body.toLowerCase().includes("gado")) {
      await reply("¡Eres el gadón guerrero!");
      return;
    }

    if (body === "salve") {
      await reply("¡Salve, salve!");
      return;
    }
  }

  /**
   * 🚫 Anti-link 🔗
   */
  if (
    !checkPrefix(prefix) &&
    isActiveAntiLinkGroup(from) &&
    isLink(body) &&
    !(await isAdmin(userJid))
  ) {
    await ban(from, userJid);
    await reply("¡Anti-link activado! Fuiste removido por enviar un enlace!");

    return;
  }

  if (!checkPrefix(prefix)) {
    return;
  }

  try {
    /**
     * Aquí vas a definir
     * las funciones que
     * tu bot ejecutará vía "cases".
     *
     * ⚠ ATENCIÓN ⚠: No traigas funciones
     * o "cases" de
     * otros bots a este
     * sin saber lo que estás haciendo.
     *
     * Cada bot tiene sus
     * particularidades y,
     * por eso, es importante
     * tener cuidado.
     * No nos hacemos responsables
     * de los problemas
     * que puedan surgir al
     * traer códigos de otros
     * bots a este,
     * en el intento de adaptación.
     *
     * Toda ayuda será *Cobrada*
     * si tu intención
     * es adaptar los códigos
     * de otro bot a este.
     *
     * ✅ CASES ✅
     */
    switch (removeAccentsAndSpecialCharacters(command?.toLowerCase())) {
      case "antilink":
        if (!args.length) {
          throw new InvalidParameterError(
            "¡Necesitas escribir 1 o 0 (activar o desactivar)!"
          );
        }

        const antiLinkOn = args[0] === "1";
        const antiLinkOff = args[0] === "0";

        if (!antiLinkOn && !antiLinkOff) {
          throw new InvalidParameterError(
            "¡Necesitas escribir 1 o 0 (activar o desactivar)!"
          );
        }

        if (antiLinkOn) {
          activateAntiLinkGroup(from);
        } else {
          deactivateAntiLinkGroup(from);
        }

        await successReact();

        const antiLinkContext = antiLinkOn ? "activado" : "desactivado";

        await reply(`¡Recurso de anti-link ${antiLinkContext} con éxito!`);
        break;

      case "attp":
        if (!args.length) {
          throw new InvalidParameterError(
            "¡Necesitas proporcionar el texto que deseas convertir en sticker!"
          );
        }

        await waitReact();

        const url = await attp(args[0].trim());

        await successReact();

        await stickerFromURL(url);
        break;

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
            "¡Necesitas mencionar o marcar a un miembro!"
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
          throw new DangerError("¡No puedes removerte a ti mismo!");
        }

        const botJid = toUserJid(BOT_NUMBER);

        if (memberToRemoveJid === botJid) {
          throw new DangerError("¡No puedes removerme a mí!");
        }

        await ban(from, memberToRemoveJid);

        await successReact();

        await reply("¡Miembro removido con éxito!");
        break;

      case "cep":
        const cep = args[0];

        if (!cep || ![8, 9].includes(cep.length)) {
          throw new InvalidParameterError(
            "¡Necesitas enviar un CEP en el formato 00000-000 o 00000000!"
          );
        }

        const data = await consultarCep(cep);

        if (!data.cep) {
          await warningReply("¡CEP no encontrado!");
          return;
        }

        await successReply(`*Resultado*
        
*CEP*: ${data.cep}
*Logradouro*: ${data.logradouro}
*Complemento*: ${data.complemento}
*Bairro*: ${data.bairro}
*Localidade*: ${data.localidade}
*UF*: ${data.uf}
*IBGE*: ${data.ibge}`);
        break;

      case "ravito":  // Comando cambiado a .ravito
        const text = args[0];

        if (!text) {
          throw new InvalidParameterError(
            "¡Necesitas decirme qué debo responder!"
          );
        }

        await waitReact();

        const responseText = await gpt4(text);  // Respuesta de GPT

        await successReply(responseText);
        break;

      case "somosultra":
      case "tagall":
      case "marcar":
        const { participants } = await lite.groupMetadata(from);

        const mentions = participants.map(({ id }) => id);

        await react("📢");

        await sendText(`¡Hola, hola! Mis Cracks🐾\n ¡Marcando a todos!🤖📢\n\n${fullArgs}`, mentions);
        break;

      case "menu":
        await successReact();
        await imageFromFile(
          path.join(ASSETS_DIR, "images", "menu.png"),
          `\n\n${menu()}`
        );
        break;
    }
  } catch (error) {
    if (error instanceof InvalidParameterError) {
      await warningReply(`¡Parámetros inválidos! ${error.message}`);
    } else if (error instanceof WarningError) {
      await warningReply(error.message);
    } else if (error instanceof DangerError) {
      await errorReply(error.message);
    } else {
      errorLog(`Error al ejecutar el comando: ${error.message}`);

      await errorReply(
        `¡Ocurrió un error al ejecutar el comando ${command.name}!

📄 *Detalles*: ${error.message}`
      );
    }
  }
}

module.exports = { runLite };
