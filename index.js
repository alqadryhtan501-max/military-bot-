const {
    Client,
    GatewayIntentBits
} = require('discord.js');

const setupPanel = require('./src/commands/setupPanel');
const { handleButtons } = require('./src/commands/buttons/buttonHandler');
const { handleModals } = require('./src/commands/modals/modalHandler');

// 💡 تم تحديث التوكن الجديد بنجاح هنا
const DISCORD_TOKEN = "MTUzOTMzNzc0NzA4MzU1OTA0Mg.GOqFeJ.GMyhRnrfJE6HdCXGgp5_JTcfqe-XtMRARQ0-wM";
const GUILD_ID = "1539302231478763553";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    console.log(`🤖 تم تشغيل البوت بنجاح: ${client.user.tag}`);
    console.log(`📡 مرتبط بالسيرفر رقم: ${GUILD_ID}`);
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

client.login(DISCORD_TOKEN);
