/**
 * Script de inicialización del bot.
 *
 * Este script es responsable de iniciar la conexión con WhatsApp.
 *
 * No se recomienda modificar este archivo a menos que sepas lo que estás haciendo.
 *
 * @autor Adaptado
 */
const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  isJidBroadcast,
  isJidStatusBroadcast,
  proto,
  makeInMemoryStore,
  isJidNewsletter,
  delay,
} = require("baileys");
const NodeCache = require("node-cache");
const pino = require("pino");
const { BAILEYS_CREDS_DIR } = require("./config");
const { runLite } = require("./index");
const { onlyNumbers } = require("./utils/functions");
const {
  textInput,
  infoLog,
  warningLog,
  errorLog,
  successLog,
  bannerLog,
} = require("./utils/terminal");
const { welcome } = require("./welcome");

const msgRetryCounterCache = new NodeCache();
const store = makeInMemoryStore({
  logger: pino().child({ level: "silent", stream: "store" }),
});

bannerLog();

async function startConnection() {
  const { state, saveCreds } = await useMultiFileAuthState(BAILEYS_CREDS_DIR);
  const { version } = await fetchLatestBaileysVersion();

  const socket = makeWASocket({
    version,
    logger: pino({ level: "error" }),
    printQRInTerminal: false,
    defaultQueryTimeoutMs: 60 * 1000,
    auth: state,
    shouldIgnoreJid: (jid) =>
      isJidBroadcast(jid) || isJidStatusBroadcast(jid) || isJidNewsletter(jid),
    keepAliveIntervalMs: 60 * 1000,
    markOnlineOnConnect: true,
    msgRetryCounterCache,
    shouldSyncHistoryMessage: () => false,
  });

  if (!socket.authState.creds.registered) {
    warningLog("¡Credenciales aún no configuradas!");

    let enableTutor = "s";
    do {
      if (!["s", "n"].includes(enableTutor)) {
        errorLog("¡Opción inválida! Intenta de nuevo.");
      }

      enableTutor = await textInput(
        "¿Deseas activar el tutorial con explicaciones detalladas para instalación? (s/n): "
      );
    } while (!["s", "n"].includes(enableTutor));

    infoLog(
      'Por favor, ingresa el número del bot como aparece en WhatsApp (solo números, ejemplo: "51912345678")'
    );

    const phoneNumber = await textInput("Ingresa tu número de teléfono: ");

    if (!phoneNumber) {
      errorLog(
        'Número de teléfono inválido. Intenta nuevamente con el comando "npm start".'
      );
      process.exit(1);
    }

    const code = await socket.requestPairingCode(onlyNumbers(phoneNumber));
    infoLog(`Código de emparejamiento: ${code}`);
  }

  socket.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const statusCode =
        lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;

      if (statusCode === DisconnectReason.loggedOut) {
        errorLog("¡Bot desconectado!");
      } else {
        switch (statusCode) {
          case DisconnectReason.badSession:
            warningLog("¡Sesión inválida!");
            break;
          case DisconnectReason.connectionClosed:
            warningLog("¡Conexión cerrada!");
            break;
          case DisconnectReason.connectionLost:
            warningLog("¡Conexión perdida!");
            break;
          case DisconnectReason.connectionReplaced:
            warningLog("¡Conexión reemplazada!");
            break;
          case DisconnectReason.multideviceMismatch:
            warningLog("¡Dispositivo incompatible!");
            break;
          case DisconnectReason.forbidden:
            warningLog("¡Conexión prohibida!");
            break;
          case DisconnectReason.restartRequired:
            infoLog('Por favor, reinicia el bot escribiendo "npm start".');
            break;
          case DisconnectReason.unavailableService:
            warningLog("¡Servicio no disponible!");
            break;
        }

        startConnection();
      }
    } else if (connection === "open") {
      successLog("¡Conexión exitosa!");
    }
  });

  socket.ev.on("creds.update", saveCreds);
  socket.ev.on("messages.upsert", (data) => {
    runLite({ socket, data });
  });

  socket.ev.on("group-participants.update", (data) => {
    welcome({ socket, data });
  });

  return socket;
}

startConnection();

