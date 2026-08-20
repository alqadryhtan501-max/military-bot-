const {
    Client,
    GatewayIntentBits
} = require('discord.js');

require('dotenv').config();


// =====================================================
// الأنظمة
// =====================================================

// لوحة النظام
const setupPanel =
    require('./src/commands/setupPanel');


// نظام الأزرار العام
const {
    handleButtons
} = require('./src/commands/buttons/buttonHandler');


// نظام الـ Modals العام
const {
    handleModals
} = require('./src/commands/modals/modalHandler');


// نظام البنك
const {
    handleBankCommand
} = require('./src/commands/bank/bankHandler');


// نظام الشخصيات
const {
    showCharactersMenu,
    handleCharacterButtons,
    handleCharacterModals
} = require('./src/commands/characters/characterHandler');


// =====================================================
// Environment
// =====================================================

const DISCORD_TOKEN =
    process.env.DISCORD_TOKEN;

const GUILD_ID =
    process.env.GUILD_ID;


// =====================================================
// التحقق من Environment
// =====================================================

if (!DISCORD_TOKEN) {

    console.error(
        '❌ DISCORD_TOKEN غير موجود في ملف .env'
    );

    process.exit(1);
}

if (!GUILD_ID) {

    console.warn(
        '⚠️ GUILD_ID غير موجود في ملف .env'
    );
}


// =====================================================
// إنشاء البوت
// =====================================================

const client = new Client({

    intents: [

        GatewayIntentBits.Guilds,

        GatewayIntentBits.GuildMessages,

        GatewayIntentBits.MessageContent

    ]

});


// =====================================================
// Ready
// =====================================================

client.once('ready', () => {

    console.log('');
    console.log('======================================');
    console.log(
        `🤖 تم تشغيل البوت بنجاح: ${client.user.tag}`
    );
    console.log(
        `📡 مرتبط بالسيرفر رقم: ${GUILD_ID}`
    );
    console.log(
        `🆔 Bot ID: ${client.user.id}`
    );
    console.log('======================================');
    console.log('');

});


// =====================================================
// Interaction Handler
// =====================================================

client.on(
    'interactionCreate',
    async (interaction) => {

        try {

            // =================================================
            // Slash Commands
            // =================================================

            if (interaction.isChatInputCommand()) {


                // =============================================
                // لوحة الشخصيات
                // =============================================

                if (
                    interaction.commandName ===
                    'setup-characters'
                ) {

                    return await showCharactersMenu(
                        interaction
                    );

                }


                // =============================================
                // لوحة النظام الرئيسية
                // =============================================

                if (
                    interaction.commandName ===
                    'setup-panel'
                ) {

                    return await setupPanel.execute(
                        interaction
                    );

                }


                // =============================================
                // أوامر البنك
                // =============================================

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


            // =================================================
            // Buttons
            // =================================================

            if (interaction.isButton()) {


                // =============================================
                // أزرار نظام الشخصيات
                // =============================================

                if (
                    interaction.customId.startsWith(
                        'character_'
                    )
                ) {

                    return await handleCharacterButtons(
                        interaction
                    );

                }


                // =============================================
                // باقي أزرار النظام
                // =============================================

                return await handleButtons(
                    interaction
                );

            }


            // =================================================
            // Modals
            // =================================================

            if (interaction.isModalSubmit()) {


                // =============================================
                // Modals نظام الشخصيات
                // =============================================

                if (
                    interaction.customId.startsWith(
                        'character_'
                    )
                ) {

                    return await handleCharacterModals(
                        interaction
                    );

                }


                // =============================================
                // باقي Modals النظام
                // =============================================

                return await handleModals(
                    interaction
                );

            }

        } catch (error) {

            console.error('');
            console.error(
                '❌ Interaction Error:'
            );
            console.error(error);
            console.error('');


            // =================================================
            // الرد على الخطأ
            // =================================================

            try {

                if (
                    interaction.replied ||
                    interaction.deferred
                ) {

                    await interaction.followUp({

                        content:
                            '❌ حدث خطأ أثناء تنفيذ العملية.',

                        ephemeral: true

                    });

                } else {

                    await interaction.reply({

                        content:
                            '❌ حدث خطأ أثناء تنفيذ العملية.',

                        ephemeral: true

                    });

                }

            } catch (replyError) {

                console.error(
                    '❌ تعذر إرسال رسالة الخطأ:',
                    replyError
                );

            }

        }

    }
);


// =====================================================
// أخطاء البوت
// =====================================================

client.on(
    'error',
    (error) => {

        console.error(
            '❌ Discord Client Error:',
            error
        );

    }
);


// =====================================================
// تسجيل الدخول
// =====================================================

client.login(
    DISCORD_TOKEN
);
