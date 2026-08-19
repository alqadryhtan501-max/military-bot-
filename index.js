require('dotenv').config();

const {
    Client,
    GatewayIntentBits
} = require('discord.js');

// استدعاء الأوامر والأزرار والمودال بالمسارات المتطابقة تماماً مع لقطات الشاشة الحالية
const setupPanel = require('./src/commands/setupPanel');
const { handleButtons } = require('./src/commands/buttons/buttonHandler');

// 💡 تعديل المسار هنا ليتوافق مع المجلد المتداخل في الجيت هاب لديك: src/commands/src/modals/
const { handleModals } = require('./src/commands/commands/src/modals/modalHandler'); 

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    // 💡 تم تعديل علامات الاقتباس إلى ` لكي يعمل الـ Template Literal ويظهر اسم البوت
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
