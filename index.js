require('dotenv').config();

const {
    Client,
    GatewayIntentBits
} = require('discord.js');

const setupPanel = require('./src/commands/setupPanel');
const { handleButtons } = require('./src/buttons/buttonHandler');
const { handleModals } = require('./src/modals/modalHandler');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    console.log(`🤖 تم تشغيل البوت بنجاح باسم: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {

    if (message.author.bot) return;

    if (message.content === '!setup-panel') {
        await setupPanel.execute(message);
    }

});

client.on('interactionCreate', async (interaction) => {

    if (interaction.isButton()) {
        return handleButtons(interaction);
    }

    if (interaction.isModalSubmit()) {
        return handleModals(interaction);
    }

});

client.login(process.env.DISCORD_TOKEN);
