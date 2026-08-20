const {
    Client,
    GatewayIntentBits,
    MessageFlags
} = require('discord.js');

require('dotenv').config();


// =====================================================
// الأنظمة
// =====================================================

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


// =====================================================
// نظام الشخصيات
// =====================================================

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
                // setup-characters
                // =============================================

                if (
                    interaction.commandName ===
                    'setup-characters'
                ) {

                    console.log(
                        '🆔 تم استلام أمر setup-characters'
                    );

                    if (
                        typeof characterHandler.showCharactersMenu !==
                        'function'
                    ) {

                        console.error(
                            '❌ showCharactersMenu غير موجودة في characterHandler.js'
                        );

                        return await interaction.reply({
                            content:
                                '❌ نظام الشخصيات غير مكتمل. راجع characterHandler.js',
                            flags: MessageFlags.Ephemeral
                        });

                    }

                    return await characterHandler.showCharactersMenu(
                        interaction
                    );

                }


                // =============================================
                // setup-panel
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


                // إذا وصل أمر غير معروف
                console.log(
                    `⚠️ أمر غير معروف: ${interaction.commandName}`
                );

                return;

            }


            // =================================================
            // Buttons
            // =================================================

            if (interaction.isButton()) {

                // =============================================
                // أزرار الشخصيات
                // =============================================

                if (
                    interaction.customId.startsWith(
                        'character_'
                    )
                ) {

                    if (
                        typeof characterHandler.handleCharacterButtons !==
                        'function'
                    ) {

                        return await interaction.reply({

                            content:
                                '❌ نظام أزرار الشخصيات غير متوفر.',

                            flags:
                                MessageFlags.Ephemeral

                        });

                    }

                    return await characterHandler.handleCharacterButtons(
                        interaction
                    );

                }


                // =============================================
                // باقي الأزرار
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
                // Modals الشخصيات
                // =============================================

                if (
                    interaction.customId.startsWith(
                        'character_'
                    )
                ) {

                    if (
                        typeof characterHandler.handleCharacterModals !==
                        'function'
                    ) {

                        return await interaction.reply({

                            content:
                                '❌ نظام Modals الشخصيات غير متوفر.',

                            flags:
                                MessageFlags.Ephemeral

                        });

                    }

                    return await characterHandler.handleCharacterModals(
                        interaction
                    );

                }


                // =============================================
                // باقي Modals
                // =============================================

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
                '❌ Interaction Error:'
            );

            console.error(error);

            console.error(
                '======================================'
            );

            console.error('');


            // =================================================
            // إرسال رسالة الخطأ
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
// تسجيل الدخول
// =====================================================

client.login(
    DISCORD_TOKEN
);
