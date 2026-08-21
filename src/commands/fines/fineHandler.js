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
// التحقق من الإدارة
// =====================================================

function isAdmin(interaction) {

    return (
        interaction.member &&
        interaction.member.permissions &&
        interaction.member.permissions.has(
            PermissionFlagsBits.Administrator
        )
    );
}


// =====================================================
// الحصول على المخالفات
// =====================================================

function getFines(character) {

    if (
        !Array.isArray(character.fines)
    ) {

        character.fines = [];
    }

    return character.fines;
}


// =====================================================
// التعامل مع أوامر المخالفات
// =====================================================

async function handleFineCommand(interaction) {

    const command =
        interaction.commandName;


    // =================================================
    // 🚨 عرض مخالفات الكركتر الحالي
    // =================================================

    if (
        command === 'fines'
    ) {

        const character =
            requireActiveCharacter(interaction);

        if (!character) {
            return;
        }


        const fines =
            getFines(character);


        const unpaidFines =
            fines.filter(
                fine =>
                    fine.status !== 'paid'
            );


        const paidFines =
            fines.filter(
                fine =>
                    fine.status === 'paid'
            );


        // لا توجد مخالفات
        if (
            fines.length === 0
        ) {

            const embed =
                new EmbedBuilder()

                    .setTitle('🚨 المخالفات')

                    .setDescription(
                        `👤 المواطن: **${character.name}**\n` +
                        `🪪 الهوية: \`${character.citizenId}\`\n\n` +
                        '✅ لا توجد لديك أي مخالفات.'
                    )

                    .setColor('#2b2d31')

                    .setTimestamp();


            return interaction.reply({

                embeds:
                    [embed],

                flags:
                    MessageFlags.Ephemeral

            });
        }


        let description =
            `👤 المواطن: **${character.name}**\n` +
            `🪪 الهوية: \`${character.citizenId}\`\n\n`;


        // =================================================
        // المخالفات غير المدفوعة
        // =================================================

        if (
            unpaidFines.length > 0
        ) {

            description +=
                '### 🔴 مخالفات غير مدفوعة\n\n';


            unpaidFines.forEach(
                (fine, index) => {

                    description +=
                        `**${index + 1}. ${fine.reason}**\n`;

                    description +=
                        `🆔 رقم المخالفة: \`${fine.id}\`\n`;

                    description +=
                        `💰 المبلغ: **${formatMoney(fine.amount)}**\n`;

                    description +=
                        `👮 المحرر: **${fine.issuedBy || 'غير محدد'}**\n\n`;
                }
            );
        }


        // =================================================
        // المخالفات المدفوعة
        // =================================================

        if (
            paidFines.length > 0
        ) {

            description +=
                '### 🟢 مخالفات مدفوعة\n\n';


            paidFines.forEach(
                fine => {

                    description +=
                        `**${fine.reason}**\n`;

                    description +=
                        `🆔 رقم المخالفة: \`${fine.id}\`\n`;

                    description +=
                        `💰 المبلغ: **${formatMoney(fine.amount)}**\n`;

                    description +=
                        `✅ الحالة: مدفوعة\n\n`;
                }
            );
        }


        // =================================================
        // حالة الخدمات
        // =================================================

        if (
            character.servicesSuspended
        ) {

            description +=
                '### ⛔ إيقاف الخدمات\n\n';

            description +=
                `**السبب:** ${character.suspensionReason || 'غير محدد'}\n\n`;

        } else {

            description +=
                '### 🟢 الخدمات\n\n';

            description +=
                'الخدمات غير موقوفة.\n\n';
        }


        const totalUnpaid =
            unpaidFines.reduce(
                (total, fine) =>
                    total +
                    Number(fine.amount || 0),
                0
            );


        description +=
            `💰 إجمالي المخالفات غير المدفوعة: **${formatMoney(totalUnpaid)}**`;


        const embed =
            new EmbedBuilder()

                .setTitle('🚨 سجل المخالفات')

                .setDescription(description)

                .setColor(
                    unpaidFines.length > 0
                        ? '#ff0000'
                        : '#2b2d31'
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
    // 💳 دفع مخالفة
    // =================================================

    if (
        command === 'pay-fine'
    ) {

        const character =
            requireActiveCharacter(interaction);

        if (!character) {
            return;
        }


        const fineId =
            interaction.options.getString(
                'المخالفة'
            );


        if (!fineId) {

            return interaction.reply({

                content:
                    '❌ يجب كتابة رقم المخالفة.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        const fines =
            getFines(character);


        const fine =
            fines.find(
                item =>
                    String(item.id) ===
                    String(fineId)
            );


        if (!fine) {

            return interaction.reply({

                content:
                    '❌ لم يتم العثور على هذه المخالفة في كركترك الحالي.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        if (
            fine.status === 'paid'
        ) {

            return interaction.reply({

                content:
                    '❌ هذه المخالفة مدفوعة مسبقاً.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        const amount =
            Number(fine.amount || 0);


        if (
            Number(character.bank || 0) < amount
        ) {

            return interaction.reply({

                content:
                    `❌ رصيد البنك غير كافي.\n\n` +
                    `💰 قيمة المخالفة: **${formatMoney(amount)}**\n` +
                    `🏦 رصيد البنك: **${formatMoney(character.bank)}**`,

                flags:
                    MessageFlags.Ephemeral

            });
        }


        const result =
            citizens.payFine(

                character.citizenId,

                fineId

            );


        if (!result) {

            return interaction.reply({

                content:
                    '❌ تعذر دفع المخالفة.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        return interaction.reply({

            content:

                `✅ **تم دفع المخالفة بنجاح.**\n\n` +

                `👤 الكركتر: **${result.character.name}**\n` +

                `🪪 الهوية: \`${result.character.citizenId}\`\n` +

                `🚨 المخالفة: **${result.fine.reason}**\n` +

                `💰 المبلغ المدفوع: **${formatMoney(result.fine.amount)}**\n\n` +

                `🏦 رصيد البنك الجديد: **${formatMoney(result.character.bank)}**`,

            flags:
                MessageFlags.Ephemeral

        });
    }


    // =================================================
    // 👮 إضافة مخالفة - إدارة
    // =================================================

    if (
        command === 'fine-add'
    ) {

        if (!isAdmin(interaction)) {

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


        const reason =
            interaction.options.getString(
                'السبب'
            );


        const amount =
            interaction.options.getNumber(
                'المبلغ'
            );


        if (!citizenId) {

            return interaction.reply({

                content:
                    '❌ يجب كتابة رقم الهوية.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        if (!reason) {

            return interaction.reply({

                content:
                    '❌ يجب كتابة سبب المخالفة.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {

            return interaction.reply({

                content:
                    '❌ مبلغ المخالفة غير صحيح.',

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


        const issuedBy =
            interaction.user.username;


        const fine =
            citizens.addFine(

                character.citizenId,

                {
                    reason,
                    amount,
                    issuedBy
                }

            );


        if (!fine) {

            return interaction.reply({

                content:
                    '❌ تعذر إضافة المخالفة.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        return interaction.reply({

            content:

                `🚨 **تم إصدار مخالفة بنجاح.**\n\n` +

                `👤 المواطن: **${character.name}**\n` +

                `🪪 الهوية: \`${character.citizenId}\`\n` +

                `🚨 السبب: **${fine.reason}**\n` +

                `💰 المبلغ: **${formatMoney(fine.amount)}**\n` +

                `🆔 رقم المخالفة: \`${fine.id}\``,

            flags:
                MessageFlags.Ephemeral

        });
    }


    // =================================================
    // 🗑️ حذف مخالفة - إدارة
    // =================================================

    if (
        command === 'fine-remove'
    ) {

        if (!isAdmin(interaction)) {

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


        const fineId =
            interaction.options.getString(
                'المخالفة'
            );


        if (!citizenId || !fineId) {

            return interaction.reply({

                content:
                    '❌ يجب تحديد الهوية ورقم المخالفة.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        const result =
            citizens.removeFine(

                citizenId,

                fineId

            );


        if (!result) {

            return interaction.reply({

                content:
                    '❌ لم يتم العثور على المخالفة.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        return interaction.reply({

            content:

                `🗑️ **تم حذف المخالفة بنجاح.**\n\n` +

                `👤 المواطن: **${citizenId}**\n` +

                `🚨 السبب: **${result.reason}**\n` +

                `💰 المبلغ: **${formatMoney(result.amount)}**\n` +

                `🆔 المخالفة: \`${result.id}\``,

            flags:
                MessageFlags.Ephemeral

        });
    }


    // =================================================
    // ⛔ إيقاف الخدمات - إدارة
    // =================================================

    if (
        command === 'services-suspend'
    ) {

        if (!isAdmin(interaction)) {

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


        const reason =
            interaction.options.getString(
                'السبب'
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


        const updated =
            citizens.suspendServices(

                citizenId,

                reason

            );


        if (!updated) {

            return interaction.reply({

                content:
                    '❌ تعذر إيقاف الخدمات.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        return interaction.reply({

            content:

                `⛔ **تم إيقاف الخدمات.**\n\n` +

                `👤 المواطن: **${updated.name}**\n` +

                `🪪 الهوية: \`${updated.citizenId}\`\n` +

                `📋 السبب: **${updated.suspensionReason || 'غير محدد'}**`,

            flags:
                MessageFlags.Ephemeral

        });
    }


    // =================================================
    // ✅ تفعيل الخدمات - إدارة
    // =================================================

    if (
        command === 'services-activate'
    ) {

        if (!isAdmin(interaction)) {

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


        const updated =
            citizens.activateServices(
                citizenId
            );


        if (!updated) {

            return interaction.reply({

                content:
                    '❌ تعذر تفعيل الخدمات.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        return interaction.reply({

            content:

                `✅ **تم تفعيل الخدمات.**\n\n` +

                `👤 المواطن: **${updated.name}**\n` +

                `🪪 الهوية: \`${updated.citizenId}\`\n` +

                `🟢 الخدمات أصبحت مفعلة.`,

            flags:
                MessageFlags.Ephemeral

        });
    }


    // =================================================
    // الأمر غير معروف
    // =================================================

    return interaction.reply({

        content:
            '❌ أمر مخالفات غير معروف.',

        flags:
            MessageFlags.Ephemeral

    });
}


// =====================================================
// التصدير
// =====================================================

module.exports = {

    handleFineCommand

};
