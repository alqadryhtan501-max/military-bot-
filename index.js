const {
    Client,
    GatewayIntentBits
} = require('discord.js');

const setupPanel =
    require('./src/commands/setupPanel');

const {
    handleButtons
} = require('./src/commands/buttons/buttonHandler');

const {
    handleModals
} = require('./src/commands/modals/modalHandler');

const {
    handleBankCommand
} = require('./src/commands/bank/bankHandler');

require('dotenv').config();

const DISCORD_TOKEN =
    process.env.DISCORD_TOKEN;

const GUILD_ID =
    process.env.GUILD_ID;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {

    console.log(
        `🤖 تم تشغيل البوت بنجاح: ${client.user.tag}`
    );

    console.log(
        `📡 مرتبط بالسيرفر رقم: ${GUILD_ID}`
    );

});

client.on('interactionCreate', async (interaction) => {

    try {

        // =========================
        // Slash Commands
        // =========================
        if (interaction.isChatInputCommand()) {

            if (
                interaction.commandName ===
                'setup-panel'
            ) {
                return await setupPanel.execute(
                    interaction
                );
            }

            const bankCommands = [
                'bank',
                'deposit',
                'withdraw',
                'transfer',
                'give',
                'bank-give',
                'bank-take',
                'bank-reset',
                'bank-set',
                'bank-info'
            ];

            if (
                bankCommands.includes(
                    interaction.commandName
                )
            ) {
                return await handleBankCommand(
                    interaction
                );
            }
        }

        // =========================
        // Buttons
        // =========================
        if (interaction.isButton()) {

            return await handleButtons(
                interaction
            );

        }

        // =========================
        // Modals
        // =========================
        if (interaction.isModalSubmit()) {

            return await handleModals(
                interaction
            );

        }

    } catch (error) {

        console.error(
            'Interaction Error:',
            error
        );

        if (
            !interaction.replied &&
            !interaction.deferred
        ) {

            await interaction.reply({
                content:
                    '❌ حدث خطأ أثناء تنفيذ الأمر.',
                ephemeral: true
            });

        }

    }

});

client.login(DISCORD_TOKEN);
