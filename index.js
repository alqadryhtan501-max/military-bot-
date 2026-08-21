const {
    Client,
    GatewayIntentBits,
    MessageFlags
} = require('discord.js');

require('dotenv').config();


// =====================================================
// الأنظمة
// =====================================================

// لوحة النظام الرئيسية
const setupPanel =
    require('./src/commands/setupPanel');

// نظام الأزرار العام
const {
    handleButtons
} = require('./src/commands/buttons/buttonHandler');

// نظام المودالات العام
const {
    handleModals
} = require('./src/commands/modals/modalHandler');

// نظام البنك
const {
    handleBankCommand
} = require('./src/commands/bank/bankHandler');

// نظام الكركترات
const characterHandler =
    require('./src/commands/characters/characterHandler');


// =====================================================
// Environment
// =====================================================

const DISCORD_TOKEN =
    process.env.DISCORD_TOKEN;

const GUILD_ID =
    process.env.GUILD_ID;


// =====================================================
// التحقق من الإعدادات
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
// تشغيل البوت
// =====================================================

client.once('clientReady', () => {

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

                const commandName =
                    interaction.commandName;


                console.log(
                    `📥 Command: ${commandName}`
                );


                // =================================================
                // نظام الكركترات
                // =================================================

                if (
                    commandName ===
                    'setup-characters'
                ) {

                    if (
                        !characterHandler ||
                        typeof characterHandler.showCharactersMenu !==
                        'function'
                    ) {

                        console.error(
                            '❌ showCharactersMenu غير موجودة'
                        );

                        return await interaction.reply({
                            content:
                                '❌ نظام الكركترات غير جاهز.',
                            flags:
                                MessageFlags.Ephemeral
                        });

                    }

                    return await characterHandler.showCharactersMenu(
                        interaction
                    );
                }


                // =================================================
                // لوحة النظام
                // =================================================

                if (
                    commandName ===
                    'setup-panel'
                ) {

                    return await setupPanel.execute(
                        interaction
                    );
                }


                // =================================================
                // أوامر البنك
                // =================================================

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
                        commandName
                    )
                ) {

                    return await handleBankCommand(
                        interaction
                    );
                }


                // =================================================
                // أمر غير معروف
                // =================================================

                console.log(
                    `⚠️ أمر غير معروف: ${commandName}`
                );

                return;
            }


            // =================================================
            // Buttons
            // =================================================

            if (interaction.isButton()) {

                const customId =
                    interaction.customId;


                console.log(
                    `🔘 Button: ${customId}`
                );


                // =================================================
                // أزرار الكركترات
                // =================================================

                if (
                    customId.startsWith(
                        'character_'
                    )
                ) {

                    if (
                        !characterHandler ||
                        typeof characterHandler.handleCharacterButtons !==
                        'function'
                    ) {

                        return await interaction.reply({
                            content:
                                '❌ نظام أزرار الكركترات غير جاهز.',
                            flags:
                                MessageFlags.Ephemeral
                        });

                    }

                    return await characterHandler.handleCharacterButtons(
                        interaction
                    );
                }


                // =================================================
                // باقي الأزرار
                // =================================================

                return await handleButtons(
                    interaction
                );
            }


            // =================================================
            // Modals
            // =================================================

            if (interaction.isModalSubmit()) {

                const customId =
                    interaction.customId;


                console.log(
                    `📝 Modal: ${customId}`
                );


                // =================================================
                // Modals الكركترات
                // =================================================

                if (
                    customId.startsWith(
                        'character_'
                    )
                ) {

                    if (
                        !characterHandler ||
                        typeof characterHandler.handleCharacterModals !==
                        'function'
                    ) {

                        return await interaction.reply({
                            content:
                                '❌ نظام مودالات الكركترات غير جاهز.',
                            flags:
                                MessageFlags.Ephemeral
                        });

                    }

                    return await characterHandler.handleCharacterModals(
                        interaction
                    );
                }


                // =================================================
                // باقي المودالات
                // =================================================

                return await handleModals(
                    interaction
                );
            }

        } catch (error) {

            console.error('');
            console.error(
                '======================================'
            );

            console.error(
                '❌ Interaction Error'
            );

            console.error(error);

            console.error(
                '======================================'
            );

            console.error('');


            // =================================================
            // إرسال الخطأ للمستخدم
            // =================================================

            try {

                if (
                    interaction.replied ||
                    interaction.deferred
                ) {

                    await interaction.followUp({
                        content:
                            '❌ حدث خطأ أثناء تنفيذ العملية.',
                        flags:
                            MessageFlags.Ephemeral
                    });

                } else {

                    await interaction.reply({
                        content:
                            '❌ حدث خطأ أثناء تنفيذ العملية.',
                        flags:
                            MessageFlags.Ephemeral
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
// أخطاء Discord Client
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
// أخطاء غير معالجة
// =====================================================

process.on(
    'unhandledRejection',
    (error) => {

        console.error(
            '❌ Unhandled Rejection:',
            error
        );

    }
);

process.on(
    'uncaughtException',
    (error) => {

        console.error(
            '❌ Uncaught Exception:',
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
