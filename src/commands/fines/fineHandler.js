const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    MessageFlags
} = require('discord.js');

const citizens = require('../../utils/citizens');


// =====================================================
// إعدادات الشرطة
// =====================================================

// حط ID رتبة الشرطة هنا
const POLICE_ROLE_ID = 'حط_ايدي_رتبة_الشرطة_هنا';


// =====================================================
// تنسيق الأموال
// =====================================================

function formatMoney(amount) {

    return `${Number(amount || 0).toLocaleString('en-US')} ريال`;
}


// =====================================================
// التحقق من الشرطة
// =====================================================

function isPolice(interaction) {

    return (
        interaction.member &&
        interaction.member.roles &&
        interaction.member.roles.cache.has(
            POLICE_ROLE_ID
        )
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
// الحصول على المخالفات
// =====================================================

function getFines(character) {

    if (!Array.isArray(character.fines)) {

        character.fines = [];
    }

    return character.fines;
}


// =====================================================
// إنشاء لوحة المخالفات
// =====================================================

async function showFinesPanel(interaction) {

    const character =
        getActiveCharacter(interaction);

    if (!character) {

        return interaction.reply({

            content:
                '❌ يجب أن تكون مسجل دخول في كركتر أولاً.',

            flags:
                MessageFlags.Ephemeral

        });
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


    const totalUnpaid =
        unpaidFines.reduce(
            (total, fine) =>
                total +
                Number(fine.amount || 0),
            0
        );


    const embed =
        new EmbedBuilder()

            .setTitle('🚨 نظام المخالفات')

            .setDescription(

                `👤 المواطن: **${character.name}**\n` +

                `🪪 رقم الهوية: \`${character.citizenId}\`\n\n` +

                `🔴 المخالفات غير المدفوعة: **${unpaidFines.length}**\n` +

                `🟢 المخالفات المدفوعة: **${paidFines.length}**\n` +

                `💰 إجمالي المبالغ المستحقة: **${formatMoney(totalUnpaid)}**\n\n` +

                (
                    character.servicesSuspended

                        ? `⛔ إيقاف الخدمات: **موقوفة**\n` +
                          `📋 السبب: **${character.suspensionReason || 'غير محدد'}**`

                        : '🟢 إيقاف الخدمات: **غير موقوفة**'
                )
            )

            .setColor(
                unpaidFines.length > 0
                    ? '#ff0000'
                    : '#2b2d31'
            )

            .setTimestamp();


    const row1 =
        new ActionRowBuilder()
            .addComponents(

                new ButtonBuilder()
                    .setCustomId('fines_view')
                    .setLabel('مخالفاتي')
                    .setEmoji('📋')
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId('fines_pay')
                    .setLabel('دفع مخالفة')
                    .setEmoji('💳')
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId('fines_refresh')
                    .setLabel('تحديث')
                    .setEmoji('🔄')
                    .setStyle(ButtonStyle.Secondary)

            );


    const components = [row1];


    // =================================================
    // أزرار الشرطة
    // =================================================

    if (isPolice(interaction)) {

        const row2 =
            new ActionRowBuilder()
                .addComponents(

                    new ButtonBuilder()
                        .setCustomId('fines_add')
                        .setLabel('إضافة مخالفة')
                        .setEmoji('👮')
                        .setStyle(ButtonStyle.Danger),

                    new ButtonBuilder()
                        .setCustomId('fines_remove')
                        .setLabel('حذف مخالفة')
                        .setEmoji('🗑️')
                        .setStyle(ButtonStyle.Danger),

                    new ButtonBuilder()
                        .setCustomId('services_manage')
                        .setLabel('الخدمات')
                        .setEmoji('⚙️')
                        .setStyle(ButtonStyle.Secondary)

                );

        components.push(row2);
    }


    return interaction.reply({

        embeds:
            [embed],

        components,

        flags:
            MessageFlags.Ephemeral

    });
}


// =====================================================
// عرض المخالفات
// =====================================================

async function showFines(interaction) {

    const character =
        getActiveCharacter(interaction);

    if (!character) {

        return interaction.reply({

            content:
                '❌ يجب أن تكون مسجل دخول في كركتر أولاً.',

            flags:
                MessageFlags.Ephemeral

        });
    }


    const fines =
        getFines(character);


    if (fines.length === 0) {

        return interaction.reply({

            content:
                '✅ لا توجد لديك أي مخالفات.',

            flags:
                MessageFlags.Ephemeral

        });
    }


    let description =
        `👤 المواطن: **${character.name}**\n` +
        `🪪 الهوية: \`${character.citizenId}\`\n\n`;


    fines.forEach((fine, index) => {

        const paid =
            fine.status === 'paid';


        description +=
            `${paid ? '🟢' : '🔴'} **${index + 1}. ${fine.reason}**\n`;

        description +=
            `🆔 رقم المخالفة: \`${fine.id}\`\n`;

        description +=
            `💰 المبلغ: **${formatMoney(fine.amount)}**\n`;

        description +=
            `📌 الحالة: **${paid ? 'مدفوعة' : 'غير مدفوعة'}**\n`;

        description +=
            `👮 المحرر: **${fine.issuedBy || 'غير محدد'}**\n\n`;

    });


    const embed =
        new EmbedBuilder()

            .setTitle('📋 مخالفاتي')

            .setDescription(description)

            .setColor('#2b2d31')

            .setTimestamp();


    return interaction.reply({

        embeds:
            [embed],

        flags:
            MessageFlags.Ephemeral

    });
}


// =====================================================
// التعامل مع الأزرار
// =====================================================

async function handleFineButtons(interaction) {

    const customId =
        interaction.customId;


    // =================================================
    // عرض اللوحة
    // =================================================

    if (customId === 'fines_panel') {

        return showFinesPanel(interaction);
    }


    // =================================================
    // مخالفاتي
    // =================================================

    if (customId === 'fines_view') {

        return showFines(interaction);
    }


    // =================================================
    // تحديث
    // =================================================

    if (customId === 'fines_refresh') {

        const character =
            getActiveCharacter(interaction);

        if (!character) {

            return interaction.reply({

                content:
                    '❌ يجب أن تكون مسجل دخول في كركتر أولاً.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        const fines =
            getFines(character);


        const unpaid =
            fines.filter(
                fine =>
                    fine.status !== 'paid'
            );


        const total =
            unpaid.reduce(
                (sum, fine) =>
                    sum +
                    Number(fine.amount || 0),
                0
            );


        const embed =
            new EmbedBuilder()

                .setTitle('🚨 نظام المخالفات')

                .setDescription(

                    `👤 المواطن: **${character.name}**\n` +

                    `🪪 رقم الهوية: \`${character.citizenId}\`\n\n` +

                    `🔴 المخالفات غير المدفوعة: **${unpaid.length}**\n` +

                    `💰 إجمالي المستحق: **${formatMoney(total)}**\n\n` +

                    (
                        character.servicesSuspended

                            ? `⛔ الخدمات: **موقوفة**\n` +
                              `📋 السبب: **${character.suspensionReason || 'غير محدد'}**`

                            : '🟢 الخدمات: **مفعلة**'
                    )
                )

                .setColor(
                    unpaid.length > 0
                        ? '#ff0000'
                        : '#2b2d31'
                )

                .setTimestamp();


        return interaction.update({

            embeds:
                [embed]

        });
    }


    // =================================================
    // دفع مخالفة
    // =================================================

    if (customId === 'fines_pay') {

        const modal =
            new ModalBuilder()

                .setCustomId('fines_pay_modal')

                .setTitle('💳 دفع مخالفة');


        const fineInput =
            new TextInputBuilder()

                .setCustomId('fine_id')

                .setLabel('رقم المخالفة')

                .setPlaceholder(
                    'مثال: F-1750000000000-123'
                )

                .setStyle(
                    TextInputStyle.Short
                )

                .setRequired(true);


        modal.addComponents(

            new ActionRowBuilder()
                .addComponents(fineInput)

        );


        return interaction.showModal(modal);
    }


    // =================================================
    // إضافة مخالفة - شرطة
    // =================================================

    if (customId === 'fines_add') {

        if (!isPolice(interaction)) {

            return interaction.reply({

                content:
                    '❌ هذا الزر مخصص للشرطة فقط.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        const modal =
            new ModalBuilder()

                .setCustomId('fines_add_modal')

                .setTitle('👮 إضافة مخالفة');


        const citizenInput =
            new TextInputBuilder()

                .setCustomId('citizen_id')

                .setLabel('رقم هوية المواطن')

                .setPlaceholder('مثال: 58291')

                .setStyle(
                    TextInputStyle.Short
                )

                .setRequired(true);


        const reasonInput =
            new TextInputBuilder()

                .setCustomId('fine_reason')

                .setLabel('سبب المخالفة')

                .setPlaceholder(
                    'مثال: تجاوز السرعة'
                )

                .setStyle(
                    TextInputStyle.Short
                )

                .setRequired(true)
                
                .setMaxLength(100);


        const amountInput =
            new TextInputBuilder()

                .setCustomId('fine_amount')

                .setLabel('قيمة المخالفة')

                .setPlaceholder('مثال: 500')

                .setStyle(
                    TextInputStyle.Short
                )

                .setRequired(true);


        modal.addComponents(

            new ActionRowBuilder()
                .addComponents(citizenInput),

            new ActionRowBuilder()
                .addComponents(reasonInput),

            new ActionRowBuilder()
                .addComponents(amountInput)

        );


        return interaction.showModal(modal);
    }


    // =================================================
    // حذف مخالفة - شرطة
    // =================================================

    if (customId === 'fines_remove') {

        if (!isPolice(interaction)) {

            return interaction.reply({

                content:
                    '❌ هذا الزر مخصص للشرطة فقط.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        const modal =
            new ModalBuilder()

                .setCustomId('fines_remove_modal')

                .setTitle('🗑️ حذف مخالفة');


        const citizenInput =
            new TextInputBuilder()

                .setCustomId('citizen_id')

                .setLabel('رقم هوية المواطن')

                .setPlaceholder('مثال: 58291')

                .setStyle(
                    TextInputStyle.Short
                )

                .setRequired(true);


        const fineInput =
            new TextInputBuilder()

                .setCustomId('fine_id')

                .setLabel('رقم المخالفة')

                .setPlaceholder(
                    'F-1750000000000-123'
                )

                .setStyle(
                    TextInputStyle.Short
                )

                .setRequired(true);


        modal.addComponents(

            new ActionRowBuilder()
                .addComponents(citizenInput),

            new ActionRowBuilder()
                .addComponents(fineInput)

        );


        return interaction.showModal(modal);
    }


    // =================================================
    // إدارة الخدمات
    // =================================================

    if (customId === 'services_manage') {

        if (!isPolice(interaction)) {

            return interaction.reply({

                content:
                    '❌ هذا الزر مخصص للشرطة فقط.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        const modal =
            new ModalBuilder()

                .setCustomId('services_manage_modal')

                .setTitle('⚙️ إدارة الخدمات');


        const citizenInput =
            new TextInputBuilder()

                .setCustomId('citizen_id')

                .setLabel('رقم هوية المواطن')

                .setPlaceholder('مثال: 58291')

                .setStyle(
                    TextInputStyle.Short
                )

                .setRequired(true);


        const actionInput =
            new TextInputBuilder()

                .setCustomId('services_action')

                .setLabel('الإجراء')

                .setPlaceholder(
                    'suspend = إيقاف | activate = تفعيل'
                )

                .setStyle(
                    TextInputStyle.Short
                )

                .setRequired(true);


        const reasonInput =
            new TextInputBuilder()

                .setCustomId('services_reason')

                .setLabel('السبب')

                .setPlaceholder(
                    'سبب إيقاف الخدمات'
                )

                .setStyle(
                    TextInputStyle.Paragraph
                )

                .setRequired(false);


        modal.addComponents(

            new ActionRowBuilder()
                .addComponents(citizenInput),

            new ActionRowBuilder()
                .addComponents(actionInput),

            new ActionRowBuilder()
                .addComponents(reasonInput)

        );


        return interaction.showModal(modal);
    }


    return interaction.reply({

        content:
            '❌ زر مخالفات غير معروف.',

        flags:
            MessageFlags.Ephemeral

    });
}


// =====================================================
// التعامل مع الـ Modals
// =====================================================

async function handleFineModals(interaction) {

    const customId =
        interaction.customId;


    // =================================================
    // دفع مخالفة
    // =================================================

    if (customId === 'fines_pay_modal') {

        const character =
            getActiveCharacter(interaction);

        if (!character) {

            return interaction.reply({

                content:
                    '❌ يجب أن تكون مسجل دخول في كركتر أولاً.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        const fineId =
            interaction.fields
                .getTextInputValue('fine_id')
                .trim();


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
                    '❌ لم يتم العثور على هذه المخالفة.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        if (fine.status === 'paid') {

            return interaction.reply({

                content:
                    '❌ هذه المخالفة مدفوعة مسبقاً.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        const result =
            citizens.payFine(
                character.citizenId,
                fineId
            );


        if (result === false) {

            return interaction.reply({

                content:
                    '❌ لا يوجد رصيد كافي في البنك أو تعذر دفع المخالفة.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


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

                `🚨 المخالفة: **${result.fine.reason}**\n` +

                `💰 المبلغ: **${formatMoney(result.fine.amount)}**\n` +

                `🏦 رصيد البنك الجديد: **${formatMoney(result.character.bank)}**`,

            flags:
                MessageFlags.Ephemeral

        });
    }


    // =================================================
    // إضافة مخالفة
    // =================================================

    if (customId === 'fines_add_modal') {

        if (!isPolice(interaction)) {

            return interaction.reply({

                content:
                    '❌ هذا الإجراء مخصص للشرطة فقط.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        const citizenId =
            interaction.fields
                .getTextInputValue('citizen_id')
                .trim();


        const reason =
            interaction.fields
                .getTextInputValue('fine_reason')
                .trim();


        const amountText =
            interaction.fields
                .getTextInputValue('fine_amount')
                .trim();


        const amount =
            Number(amountText);


        if (!Number.isFinite(amount) || amount <= 0) {

            return interaction.reply({

                content:
                    '❌ قيمة المخالفة غير صحيحة.',

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


        const fine =
            citizens.addFine(

                citizenId,

                {
                    reason,
                    amount,
                    issuedBy:
                        interaction.user.username
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

                `🚨 **تم إصدار المخالفة بنجاح.**\n\n` +

                `👤 المواطن: **${result.character.name}**\n` +

                `🪪 الهوية: \`${citizenId}\`\n` +

                `📋 السبب: **${fine.reason}**\n` +

                `💰 المبلغ: **${formatMoney(fine.amount)}**\n` +

                `🆔 رقم المخالفة: \`${fine.id}\``,

            flags:
                MessageFlags.Ephemeral

        });
    }


    // =================================================
    // حذف مخالفة
    // =================================================

    if (customId === 'fines_remove_modal') {

        if (!isPolice(interaction)) {

            return interaction.reply({

                content:
                    '❌ هذا الإجراء مخصص للشرطة فقط.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        const citizenId =
            interaction.fields
                .getTextInputValue('citizen_id')
                .trim();


        const fineId =
            interaction.fields
                .getTextInputValue('fine_id')
                .trim();


        const removed =
            citizens.removeFine(
                citizenId,
                fineId
            );


        if (!removed) {

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

                `👤 الهوية: \`${citizenId}\`\n` +

                `🚨 السبب: **${removed.reason}**\n` +

                `💰 المبلغ: **${formatMoney(removed.amount)}**`,

            flags:
                MessageFlags.Ephemeral

        });
    }


    // =================================================
    // إدارة الخدمات
    // =================================================

    if (customId === 'services_manage_modal') {

        if (!isPolice(interaction)) {

            return interaction.reply({

                content:
                    '❌ هذا الإجراء مخصص للشرطة فقط.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        const citizenId =
            interaction.fields
                .getTextInputValue('citizen_id')
                .trim();


        const action =
            interaction.fields
                .getTextInputValue('services_action')
                .trim()
                .toLowerCase();


        const reason =
            interaction.fields
                .getTextInputValue('services_reason')
                .trim();


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


        // =================================================
        // إيقاف الخدمات
        // =================================================

        if (
            action === 'suspend' ||
            action === 'ايقاف' ||
            action === 'إيقاف'
        ) {

            const updated =
                citizens.suspendServices(
                    citizenId,
                    reason || 'غير محدد'
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

                    `📋 السبب: **${updated.suspensionReason}**`,

                flags:
                    MessageFlags.Ephemeral

            });
        }


        // =================================================
        // تفعيل الخدمات
        // =================================================

        if (
            action === 'activate' ||
            action === 'تفعيل'
        ) {

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


        return interaction.reply({

            content:
                '❌ الإجراء غير صحيح. اكتب `suspend` للإيقاف أو `activate` للتفعيل.',

            flags:
                MessageFlags.Ephemeral

        });
    }


    return interaction.reply({

        content:
            '❌ نموذج مخالفات غير معروف.',

        flags:
            MessageFlags.Ephemeral

    });
}


// =====================================================
// التصدير
// =====================================================

module.exports = {

    showFinesPanel,
    handleFineButtons,
    handleFineModals

};
