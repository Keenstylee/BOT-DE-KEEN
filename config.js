const path = require("path");

// Prefixo dos comandos.
exports.PREFIX = ".";

// Emoji do bot (mude se preferir).
exports.BOT_EMOJI = "🤖";

// Nome do bot (mude se preferir).
exports.BOT_NAME = "FMETV - BOT";

// Número do bot (apenas números).
exports.BOT_NUMBER = "5511920202020";

// Número do dono do bot (apenas números).
exports.OWNER_NUMBER = "51968424445";

// Diretório de arquivos de mídia.
exports.ASSETS_DIR = path.resolve(__dirname, "assets");

// Diretório de arquivos temporários.
exports.TEMP_DIR = path.resolve(__dirname, "temp");

// Diretório de credenciais do Baileys.
exports.BAILEYS_CREDS_DIR = path.resolve(__dirname, "baileys");

// Timeout em milissegundos por ação (evitar banimento do número).
exports.TIMEOUT_IN_MILLISECONDS_BY_ACTION = 700;

// Plataforma de API's
exports.SPIDER_API_BASE_URL = "https://api.spiderx.com.br/api";

// Obtenha seu token, criando uma conta em: https://api.spiderx.com.br.
exports.SPIDER_API_TOKEN = "aCEKpyEA3SrZixpoWSlw";

// Idioma predeterminado (es para español, pt para português, en para inglés, etc.)
exports.LANGUAGE = "es"; // Configuración del idioma en español