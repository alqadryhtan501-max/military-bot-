const {
    EmbedBuilder,
    PermissionFlagsBits,
    MessageFlags
} = require('discord.js');

const citizens = require('../../utils/citizens');


// =====================================================
// تنسيق الأموال
// =====================================================

function formatMoney(amount) {

    return `${Number(amount || 0).toLocaleString('en-US')} ريال`;
}


// =====================================================
// الحصول على المبلغ
// =====================================================

function getAmount(interaction) {

    return interaction.options.getNumber('المبلغ');
}


// =====================================================
// التحقق من المبلغ
// =====================================================

function validAmount(amount) {

    return (
        Number.isFinite(amount) &&
        amount > 0
    );
}


// =====================================================
// الحصول على الكركتر النشط
// =====================================================

function getActiveCharacter(interaction) {

    return citizens.getActiveCharacter(
        interaction.user.id
    );
}


// =====================================================
// التحقق من وجود كركتر نشط
// =====================================================

function requireActiveCharacter(interaction) {

    const character =
        getActiveCharacter(interaction);

    if (!character) {

        interaction.reply({

            content:
                '❌ يجب أن تكون مسجل دخول في كركتر أولاً.',

            flags:
                MessageFlags.Ephemeral

        });

        return null;
    }

    return character;
}


// =====================================================
// الحصول على اسم الوظيفة
// =====================================================

function getJobName(character) {

    if (!character.job) {
        return 'لا يوجد';
    }

    if (typeof character.job === 'string') {
        return character.job;
    }

    return character.job.name || 'لا يوجد';
}


// =====================================================
// الحصول على رتبة الوظيفة
// =====================================================

function getJobRank(character) {

    if (!character.job) {
        return 'لا يوجد';
    }

    if (typeof character.job === 'string') {
        return 'لا يوجد';
    }

    return character.job.rank || 'لا يوجد';
}


// =====================================================
// التعامل مع أوامر البنك
// =====================================================

async function handleBankCommand(interaction) {

    const command =
        interaction.commandName;


    // =================================================
    // 🏦 كشف الحساب
    // =================================================

    if (command === 'bank') {

        const character =
            requireActiveCharacter(interaction);

        if (!character) {
            return;
        }


        const cash =
            Number(character.cash || 0);

        const bank =
            Number(character.bank || 0);

        const total =
            cash + bank;


        const embed =
            new EmbedBuilder()

                .setTitle('🏦 كشف الحساب')

                .setDescription(
                    `الحساب المالي للكركتر النشط **${character.name}**`
                )

                .setColor('#2b2d31')

                .addFields(

                    {
                        name: '👤 المواطن',
                        value:
                            character.name,
                        inline: false
                    },

                    {
                        name: '🪪 رقم الهوية',
                        value:
                            `\`${character.citizenId}\``,
                        inline: true
                    },

                    {
                        name: '💵 الكاش',
                        value:
                            formatMoney(cash),
                        inline: true
                    },

                    {
                        name: '🏦 البنك',
                        value:
                            formatMoney(bank),
                        inline: true
                    },

                    {
                        name: '💰 الإجمالي',
                        value:
                            `**${formatMoney(total)}**`,
                        inline: false
                    }

                )

                .setFooter({
                    text:
                        'الحساب مرتبط بالكركتر النشط'
                })

                .setTimestamp();


        return interaction.reply({

            embeds:
                [embed],

            flags:
                MessageFlags.Ephemeral

        });
    }


    // =================================================
    // 💰 إيداع
    // =================================================

    if (command === 'deposit') {

        const character =
            requireActiveCharacter(interaction);

        if (!character) {
            return;
        }


        const amount =
            getAmount(interaction);


        if (!validAmount(amount)) {

            return interaction.reply({

                content:
                    '❌ المبلغ غير صحيح.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        if (
            amount > Number(character.cash || 0)
        ) {

            return interaction.reply({

                content:
                    '❌ ما عندك كاش كافي.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        const removedCash =
            citizens.removeCash(

                character.citizenId,

                amount

            );


        if (!removedCash) {

            return interaction.reply({

                content:
                    '❌ تعذر خصم الكاش.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        const addedBank =
            citizens.addBank(

                character.citizenId,

                amount

            );


        if (!addedBank) {

            // إعادة الكاش
            citizens.addCash(
                character.citizenId,
                amount
            );

            return interaction.reply({

                content:
                    '❌ تعذر إيداع المبلغ في البنك.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        return interaction.reply({

            content:

                `✅ **تم الإيداع بنجاح.**\n\n` +

                `👤 الكركتر: **${addedBank.name}**\n` +

                `🪪 الهوية: \`${addedBank.citizenId}\`\n` +

                `💰 المبلغ: **${formatMoney(amount)}**\n\n` +

                `💵 الكاش: **${formatMoney(addedBank.cash)}**\n` +

                `🏦 البنك: **${formatMoney(addedBank.bank)}**`,

            flags:
                MessageFlags.Ephemeral

        });
    }


    // =================================================
    // 💵 سحب
    // =================================================

    if (command === 'withdraw') {

        const character =
            requireActiveCharacter(interaction);

        if (!character) {
            return;
        }


        const amount =
            getAmount(interaction);


        if (!validAmount(amount)) {

            return interaction.reply({

                content:
                    '❌ المبلغ غير صحيح.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        if (
            amount > Number(character.bank || 0)
        ) {

            return interaction.reply({

                content:
                    '❌ رصيد البنك غير كافي.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        const removedBank =
            citizens.removeBank(

                character.citizenId,

                amount

            );


        if (!removedBank) {

            return interaction.reply({

                content:
                    '❌ تعذر خصم المبلغ من البنك.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        const addedCash =
            citizens.addCash(

                character.citizenId,

                amount

            );


        if (!addedCash) {

            // إعادة المبلغ للبنك
            citizens.addBank(
                character.citizenId,
                amount
            );

            return interaction.reply({

                content:
                    '❌ تعذر إضافة الكاش.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        return interaction.reply({

            content:

                `✅ **تم السحب بنجاح.**\n\n` +

                `👤 الكركتر: **${addedCash.name}**\n` +

                `🪪 الهوية: \`${addedCash.citizenId}\`\n` +

                `💰 المبلغ: **${formatMoney(amount)}**\n\n` +

                `💵 الكاش: **${formatMoney(addedCash.cash)}**\n` +

                `🏦 البنك: **${formatMoney(addedCash.bank)}**`,

            flags:
                MessageFlags.Ephemeral

        });
    }


    // =================================================
    // 🔄 تحويل بنكي
    // =================================================

    if (command === 'transfer') {

        const sender =
            requireActiveCharacter(interaction);

        if (!sender) {
            return;
        }


        const targetId =
            interaction.options.getString(
                'الهوية'
            );


        const amount =
            getAmount(interaction);


        if (!targetId) {

            return interaction.reply({

                content:
                    '❌ يجب كتابة رقم الهوية.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        if (!validAmount(amount)) {

            return interaction.reply({

                content:
                    '❌ المبلغ غير صحيح.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        if (
            String(targetId) ===
            String(sender.citizenId)
        ) {

            return interaction.reply({

                content:
                    '❌ ما تقدر تحول لنفسك.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        const receiverResult =
            citizens.findCharacter(
                targetId
            );


        if (!receiverResult) {

            return interaction.reply({

                content:
                    '❌ رقم الهوية غير موجود.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        const receiver =
            receiverResult.character;


        if (
            amount > Number(sender.bank || 0)
        ) {

            return interaction.reply({

                content:
                    '❌ رصيد البنك غير كافي.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        const result =
            citizens.transferBank(

                sender.citizenId,

                receiver.citizenId,

                amount

            );


        if (!result) {

            return interaction.reply({

                content:
                    '❌ تعذر تنفيذ التحويل.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        return interaction.reply({

            content:

                `✅ **تم التحويل بنجاح.**\n\n` +

                `👤 من: **${result.sender.name}**\n` +

                `🪪 هويته: \`${result.sender.citizenId}\`\n\n` +

                `👤 إلى: **${result.receiver.name}**\n` +

                `🪪 هويته: \`${result.receiver.citizenId}\`\n\n` +

                `💰 المبلغ: **${formatMoney(amount)}**\n` +

                `🏦 رصيدك الجديد: **${formatMoney(result.sender.bank)}**`,

            flags:
                MessageFlags.Ephemeral

        });
    }


    // =================================================
    // 🤝 إعطاء كاش
    // =================================================

    if (command === 'give') {

        const sender =
            requireActiveCharacter(interaction);

        if (!sender) {
            return;
        }


        const targetId =
            interaction.options.getString(
                'الهوية'
            );


        const amount =
            getAmount(interaction);


        if (!targetId) {

            return interaction.reply({

                content:
                    '❌ يجب كتابة رقم الهوية.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        if (!validAmount(amount)) {

            return interaction.reply({

                content:
                    '❌ المبلغ غير صحيح.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        if (
            String(targetId) ===
            String(sender.citizenId)
        ) {

            return interaction.reply({

                content:
                    '❌ ما تقدر تعطي نفسك.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        const receiverResult =
            citizens.findCharacter(
                targetId
            );


        if (!receiverResult) {

            return interaction.reply({

                content:
                    '❌ رقم الهوية غير موجود.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        const receiver =
            receiverResult.character;


        if (
            amount > Number(sender.cash || 0)
        ) {

            return interaction.reply({

                content:
                    '❌ ما عندك كاش كافي.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        const result =
            citizens.transferCash(

                sender.citizenId,

                receiver.citizenId,

                amount

            );


        if (!result) {

            return interaction.reply({

                content:
                    '❌ تعذر تنفيذ عملية إعطاء الكاش.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        return interaction.reply({

            content:

                `✅ **تم إعطاء الكاش بنجاح.**\n\n` +

                `👤 من: **${result.sender.name}**\n` +

                `🪪 هويته: \`${result.sender.citizenId}\`\n\n` +

                `👤 إلى: **${result.receiver.name}**\n` +

                `🪪 هويته: \`${result.receiver.citizenId}\`\n\n` +

                `💰 المبلغ: **${formatMoney(amount)}**\n` +

                `💵 الكاش المتبقي: **${formatMoney(result.sender.cash)}**`,

            flags:
                MessageFlags.Ephemeral

        });
    }


    // =================================================
    // 👑 أوامر الإدارة
    // =================================================

    const adminCommands = [

        'bank-give',
        'bank-take',
        'bank-reset',
        'bank-set',
        'bank-info'

    ];


    if (
        adminCommands.includes(command)
    ) {

        // =================================================
        // صلاحية الإدارة
        // =================================================

        if (
            !interaction.member ||
            !interaction.member.permissions.has(
                PermissionFlagsBits.Administrator
            )
        ) {

            return interaction.reply({

                content:
                    '❌ هذا الأمر مخصص للإدارة فقط.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        const citizenId =
            interaction.options.getString(
                'الهوية'
            );


        if (!citizenId) {

            return interaction.reply({

                content:
                    '❌ يجب كتابة رقم الهوية.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        const result =
            citizens.findCharacter(
                citizenId
            );


        if (!result) {

            return interaction.reply({

                content:
                    '❌ لم يتم العثور على هذه الهوية.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        const character =
            result.character;


        // =================================================
        // 🏦 bank-info
        // =================================================

        if (command === 'bank-info') {

            const cash =
                Number(character.cash || 0);

            const bank =
                Number(character.bank || 0);

            const total =
                cash + bank;


            const embed =
                new EmbedBuilder()

                    .setTitle('🏦 كشف حساب مواطن')

                    .setColor('#2b2d31')

                    .addFields(

                        {
                            name: '👤 الاسم',
                            value:
                                character.name,
                            inline: false
                        },

                        {
                            name: '🪪 الهوية',
                            value:
                                `\`${character.citizenId}\``,
                            inline: true
                        },

                        {
                            name: '💵 الكاش',
                            value:
                                formatMoney(cash),
                            inline: true
                        },

                        {
                            name: '🏦 البنك',
                            value:
                                formatMoney(bank),
                            inline: true
                        },

                        {
                            name: '💰 الإجمالي',
                            value:
                                formatMoney(total),
                            inline: false
                        }

                    )

                    .setTimestamp();


            return interaction.reply({

                embeds:
                    [embed],

                flags:
                    MessageFlags.Ephemeral

            });
        }


        // =================================================
        // المبلغ
        // =================================================

        const amount =
            getAmount(interaction);


        if (
            command !== 'bank-reset' &&
            !validAmount(amount)
        ) {

            return interaction.reply({

                content:
                    '❌ المبلغ غير صحيح.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        // =================================================
        // 💰 bank-give
        // =================================================

        if (command === 'bank-give') {

            const updated =
                citizens.addBank(

                    character.citizenId,

                    amount

                );


            if (!updated) {

                return interaction.reply({

                    content:
                        '❌ تعذر إضافة المبلغ.',

                    flags:
                        MessageFlags.Ephemeral

                });
            }


            return interaction.reply({

                content:

                    `✅ **تمت إضافة المبلغ بنجاح.**\n\n` +

                    `👤 المواطن: **${character.name}**\n` +

                    `🪪 الهوية: \`${character.citizenId}\`\n` +

                    `💰 المبلغ: **${formatMoney(amount)}**\n` +

                    `🏦 الرصيد الجديد: **${formatMoney(updated.bank)}**`,

                flags:
                    MessageFlags.Ephemeral

            });
        }


        // =================================================
        // 💸 bank-take
        // =================================================

        if (command === 'bank-take') {

            if (
                amount > Number(character.bank || 0)
            ) {

                return interaction.reply({

                    content:
                        '❌ رصيد البنك أقل من المبلغ المطلوب.',

                    flags:
                        MessageFlags.Ephemeral

                });
            }


            const updated =
                citizens.removeBank(

                    character.citizenId,

                    amount

                );


            if (!updated) {

                return interaction.reply({

                    content:
                        '❌ تعذر خصم المبلغ.',

                    flags:
                        MessageFlags.Ephemeral

                });
            }


            return interaction.reply({

                content:

                    `✅ **تم خصم المبلغ بنجاح.**\n\n` +

                    `👤 المواطن: **${character.name}**\n` +

                    `🪪 الهوية: \`${character.citizenId}\`\n` +

                    `💰 المبلغ: **${formatMoney(amount)}**\n` +

                    `🏦 الرصيد الجديد: **${formatMoney(updated.bank)}**`,

                flags:
                    MessageFlags.Ephemeral

            });
        }


        // =================================================
        // 🔄 bank-reset
        // =================================================

        if (command === 'bank-reset') {

            const oldTotal =
                Number(character.cash || 0) +
                Number(character.bank || 0);


            const updated =
                citizens.resetMoney(
                    character.citizenId
                );


            if (!updated) {

                return interaction.reply({

                    content:
                        '❌ تعذر تصفير الحساب.',

                    flags:
                        MessageFlags.Ephemeral

                });
            }


            return interaction.reply({

                content:

                    `✅ **تم تصفير الحساب بنجاح.**\n\n` +

                    `👤 المواطن: **${character.name}**\n` +

                    `🪪 الهوية: \`${character.citizenId}\`\n` +

                    `💰 المبلغ الذي تم تصفيره: **${formatMoney(oldTotal)}**\n\n` +

                    `💵 الكاش: **0 ريال**\n` +

                    `🏦 البنك: **0 ريال**`,

                flags:
                    MessageFlags.Ephemeral

            });
        }


        // =================================================
        // 🎯 bank-set
        // =================================================

        if (command === 'bank-set') {

            const updated =
                citizens.updateCharacter(

                    character.citizenId,

                    {
                        bank: amount
                    }

                );


            if (!updated) {

                return interaction.reply({

                    content:
                        '❌ تعذر تحديد رصيد البنك.',

                    flags:
                        MessageFlags.Ephemeral

                });
            }


            return interaction.reply({

                content:

                    `✅ **تم تحديد رصيد البنك.**\n\n` +

                    `👤 المواطن: **${character.name}**\n` +

                    `🪪 الهوية: \`${character.citizenId}\`\n` +

                    `🏦 الرصيد الجديد: **${formatMoney(updated.bank)}**`,

                flags:
                    MessageFlags.Ephemeral

            });
        }
    }
}


// =====================================================
// التصدير
// =====================================================

module.exports = {
    handleBankCommand
};
