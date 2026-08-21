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
// التعامل مع أوامر البنك
// =====================================================

async function handleBankCommand(interaction) {

    const command =
        interaction.commandName;


    // =================================================
    // 🏦 كشف الحساب
    // =================================================

    if (command === 'bank') {

        const citizen =
            requireActiveCharacter(interaction);

        if (!citizen) {
            return;
        }


        const cash =
            Number(citizen.cash || 0);

        const bank =
            Number(citizen.bank || 0);

        const total =
            cash + bank;


        const embed =
            new EmbedBuilder()

                .setTitle('🏦 كشف الحساب')

                .setColor('#2b2d31')

                .addFields(

                    {
                        name: '👤 المواطن',
                        value:
                            citizen.name,
                        inline: false
                    },

                    {
                        name: '🪪 رقم الهوية',
                        value:
                            `\`${citizen.citizenId}\``,
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

        const citizen =
            requireActiveCharacter(interaction);

        if (!citizen) {
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
            amount > Number(citizen.cash)
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
                citizen.citizenId,
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
                citizen.citizenId,
                amount
            );


        if (!addedBank) {

            // محاولة إعادة الكاش
            citizens.addCash(
                citizen.citizenId,
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

                `💰 المبلغ: **${formatMoney(amount)}**\n` +

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

        const citizen =
            requireActiveCharacter(interaction);

        if (!citizen) {
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
            amount > Number(citizen.bank)
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
                citizen.citizenId,
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
                citizen.citizenId,
                amount
            );


        if (!addedCash) {

            // إعادة المبلغ للبنك
            citizens.addBank(
                citizen.citizenId,
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

                `💰 المبلغ: **${formatMoney(amount)}**\n` +

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
            amount > Number(sender.bank)
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

                `💰 المبلغ: **${formatMoney(amount)}**\n` +

                `👤 المستلم: **${receiver.name}**\n` +

                `🪪 الهوية: \`${receiver.citizenId}\`\n\n` +

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
            amount > Number(sender.cash)
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

                `💰 المبلغ: **${formatMoney(amount)}**\n` +

                `👤 المستلم: **${receiver.name}**\n` +

                `🪪 الهوية: \`${receiver.citizenId}\`\n\n` +

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
        // التحقق من صلاحية الإدارة
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


        const citizen =
            result.character;


        // =================================================
        // 🏦 bank-info
        // =================================================

        if (command === 'bank-info') {

            const cash =
                Number(citizen.cash || 0);

            const bank =
                Number(citizen.bank || 0);

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
                                citizen.name,
                            inline: false
                        },

                        {
                            name: '🪪 الهوية',
                            value:
                                `\`${citizen.citizenId}\``,
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
        // المبلغ للأوامر الأخرى
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
                    citizen.citizenId,
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

                    `👤 المواطن: **${citizen.name}**\n` +

                    `🪪 الهوية: \`${citizen.citizenId}\`\n` +

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
                amount > Number(citizen.bank)
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
                    citizen.citizenId,
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

                    `👤 المواطن: **${citizen.name}**\n` +

                    `🪪 الهوية: \`${citizen.citizenId}\`\n` +

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
                Number(citizen.cash || 0) +
                Number(citizen.bank || 0);


            const updated =
                citizens.resetMoney(
                    citizen.citizenId
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

                    `👤 المواطن: **${citizen.name}**\n` +

                    `🪪 الهوية: \`${citizen.citizenId}\`\n` +

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

                    citizen.citizenId,

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

                    `👤 المواطن: **${citizen.name}**\n` +

                    `🪪 الهوية: \`${citizen.citizenId}\`\n` +

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
