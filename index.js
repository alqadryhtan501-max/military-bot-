require('dotenv').config();

const {
    Client,
    GatewayIntentBits
} = require('discord.js');

const setupPanel = require('./src/commands/setupPanel');
const { handleButtons } = require('./src/commands/buttons/buttonHandler');
const { handleModals } = require('./src/commands/src/modals/modalHandler');node:internal/modules/cjs/loader:1522
  throw err;
  ^

Error: Cannot find module './src/modals/modalHandler'
Require stack:
- /data/data/com.termux/files/home/military-bot-/index.js
    at Module._resolveFilename (node:internal/modules/cjs/loader:1519:15)
    at wrapResolveFilename (node:internal/modules/cjs/loader:1073:27)
    at defaultResolveImplForCJSLoading (node:internal/modules/cjs/loader:1097:10)
    at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1124:12)
    at Module._load (node:internal/modules/cjs/loader:1296:5)
    at wrapModuleLoad (node:internal/modules/cjs/loader:255:19)
    at Module.require (node:internal/modules/cjs/loader:1619:12)
    at require (node:internal/modules/helpers:191:16)
    at Object.<anonymous> (/data/data/com.termux/files/home/military-bot-/index.js:10:26)
    at Module._compile (node:internal/modules/cjs/loader:1873:14) {
  code: 'MODULE_NOT_FOUND',
  requireStack: [ '/data/data/com.termux/files/home/military-bot-/index.js' ]
}

Node.js v26.3.1
~/military-bot- $

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    console.log(`🤖 تم تشغيل البوت: ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {

    try {

        if (interaction.isChatInputCommand()) {

            if (interaction.commandName === 'setup-panel') {
                return await setupPanel.execute(interaction);
            }

        }

        if (interaction.isButton()) {
            return await handleButtons(interaction);
        }

        if (interaction.isModalSubmit()) {
            return await handleModals(interaction);
        }

    } catch (error) {
        console.error('Interaction Error:', error);

        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: '❌ حدث خطأ أثناء تنفيذ الأمر.',
                ephemeral: true
            });
        }
    }

});

client.login(process.env.DISCORD_TOKEN);
