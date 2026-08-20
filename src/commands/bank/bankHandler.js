const {
    EmbedBuilder,
    PermissionFlagsBits
} = require('discord.js');

const {
    getCitizen,
    getCitizenByUserId,
    updateCitizen,
    addTransaction
} = require('../../utils/citizens');

function formatMoney(amount) {
    return `${Number(amount).toLocaleString()} ريال`;
}

function getAmount(interaction) {
    const amount = interaction.options.getNumber('المبلغ');
    return amount;
}

function validAmount(amount) {
    return Number.isFinite(amount) && amount > 0;
}

async function handleBankCommand(interaction) {

    const command = interaction.commandName;

    // =====================================================
    // كشف الحساب
    // =====================================================
    if (command === 'bank') {

        const citizen =
            getCitizenByUserId(interaction.user.id);

        if (!citizen) {
            return interaction.reply({
                content: '❌ ما عندك هوية مسجلة في النظام.',
                ephemeral: true
            });
        }

        const total =
            Number(citizen.cash) + Number(citizen.bank);

        const embed = new EmbedBuilder()
            .setTitle('🏦 كشف الحساب')
            .setColor('#2b2d31')
            .addFields(
                {
                    name: '👤 المواطن',
                    value: citizen.name,
                    inline: false
                },
                {
                    name: '🪪 رقم الهوية',
                    value: `\`${citizen.citizenId}\``,
                    inline: true
                },
                {
                    name: '💵 الكاش',
                    value: formatMoney(citizen.cash),
                    inline: true
                },
                {
                    name: '🏦 البنك',
                    value: formatMoney(citizen.bank),
                    inline: true
                },
                {
                    name: '💰 التوتل',
                    value: `**${formatMoney(total)}**`,
                    inline: false
                }
            )
            .setTimestamp();

        return interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    }

    // =====================================================
    // إيداع
    // =====================================================
    if (command === 'deposit') {

        const citizen =
            getCitizenByUserId(interaction.user.id);

        if (!citizen) {
            return interaction.reply({
                content: '❌ ما عندك هوية مسجلة.',
                ephemeral: true
            });
        }

        const amount = getAmount(interaction);

        if (!validAmount(amount)) {
            return interaction.reply({
                content: '❌ المبلغ غير صحيح.',
                ephemeral: true
            });
        }

        if (amount > citizen.cash) {
            return interaction.reply({
                content: '❌ ما عندك كاش كافي.',
                ephemeral: true
            });
        }

        const updated = updateCitizen(citizen.citizenId, {
            cash: citizen.cash - amount,
            bank: citizen.bank + amount
        });

        addTransaction(citizen.citizenId, {
            type: 'إيداع',
            amount
        });

        return interaction.reply({
            content:
                `✅ تم إيداع **${formatMoney(amount)}** في البنك.\n\n` +
                `💵 الكاش: ${formatMoney(updated.cash)}\n` +
                `🏦 البنك: ${formatMoney(updated.bank)}`,
            ephemeral: true
        });
    }

    // =====================================================
    // سحب
    // =====================================================
    if (command === 'withdraw') {

        const citizen =
            getCitizenByUserId(interaction.user.id);

        if (!citizen) {
            return interaction.reply({
                content: '❌ ما عندك هوية مسجلة.',
                ephemeral: true
            });
        }

        const amount = getAmount(interaction);

        if (!validAmount(amount)) {
            return interaction.reply({
                content: '❌ المبلغ غير صحيح.',
                ephemeral: true
            });
        }

        if (amount > citizen.bank) {
            return interaction.reply({
                content: '❌ رصيد البنك غير كافي.',
                ephemeral: true
            });
        }

        const updated = updateCitizen(citizen.citizenId, {
            cash: citizen.cash + amount,
            bank: citizen.bank - amount
        });

        addTransaction(citizen.citizenId, {
            type: 'سحب',
            amount
        });

        return interaction.reply({
            content:
                `✅ تم سحب **${formatMoney(amount)}**.\n\n` +
                `💵 الكاش: ${formatMoney(updated.cash)}\n` +
                `🏦 البنك: ${formatMoney(updated.bank)}`,
            ephemeral: true
        });
    }

    // =====================================================
    // تحويل بنكي
    // =====================================================
    if (command === 'transfer') {

        const sender =
            getCitizenByUserId(interaction.user.id);

        if (!sender) {
            return interaction.reply({
                content: '❌ ما عندك هوية مسجلة.',
                ephemeral: true
            });
        }

        const targetId =
            interaction.options.getString('الهوية');

        const amount = getAmount(interaction);

        const receiver = getCitizen(targetId);

        if (!receiver) {
            return interaction.reply({
                content: '❌ رقم الهوية غير موجود.',
                ephemeral: true
            });
        }

        if (receiver.citizenId === sender.citizenId) {
            return interaction.reply({
                content: '❌ ما تقدر تحول لنفسك.',
                ephemeral: true
            });
        }

        if (!validAmount(amount)) {
            return interaction.reply({
                content: '❌ المبلغ غير صحيح.',
                ephemeral: true
            });
        }

        if (amount > sender.bank) {
            return interaction.reply({
                content: '❌ رصيد البنك غير كافي.',
                ephemeral: true
            });
        }

        updateCitizen(sender.citizenId, {
            bank: sender.bank - amount
        });

        updateCitizen(receiver.citizenId, {
            bank: receiver.bank + amount
        });

        addTransaction(sender.citizenId, {
            type: `تحويل إلى ${receiver.citizenId}`,
            amount
        });

        addTransaction(receiver.citizenId, {
            type: `تحويل من ${sender.citizenId}`,
            amount
        });

        return interaction.reply({
            content:
                `✅ تم تحويل **${formatMoney(amount)}** بنجاح.\n\n` +
                `🪪 المستلم: \`${receiver.citizenId}\`\n` +
                `👤 ${receiver.name}`,
            ephemeral: true
        });
    }

    // =====================================================
    // إعطاء كاش
    // =====================================================
    if (command === 'give') {

        const sender =
            getCitizenByUserId(interaction.user.id);

        if (!sender) {
            return interaction.reply({
                content: '❌ ما عندك هوية مسجلة.',
                ephemeral: true
            });
        }

        const targetId =
            interaction.options.getString('الهوية');

        const amount = getAmount(interaction);

        const receiver = getCitizen(targetId);

        if (!receiver) {
            return interaction.reply({
                content: '❌ رقم الهوية غير موجود.',
                ephemeral: true
            });
        }

        if (receiver.citizenId === sender.citizenId) {
            return interaction.reply({
                content: '❌ ما تقدر تعطي نفسك.',
                ephemeral: true
            });
        }

        if (!validAmount(amount)) {
            return interaction.reply({
                content: '❌ المبلغ غير صحيح.',
                ephemeral: true
            });
        }

        if (amount > sender.cash) {
            return interaction.reply({
                content: '❌ ما عندك كاش كافي.',
                ephemeral: true
            });
        }

        updateCitizen(sender.citizenId, {
            cash: sender.cash - amount
        });

        updateCitizen(receiver.citizenId, {
            cash: receiver.cash + amount
        });

        addTransaction(sender.citizenId, {
            type: `إعطاء كاش إلى ${receiver.citizenId}`,
            amount
        });

        addTransaction(receiver.citizenId, {
            type: `استلام كاش من ${sender.citizenId}`,
            amount
        });

        return interaction.reply({
            content:
                `✅ تم إعطاء **${formatMoney(amount)}** إلى ${receiver.name}.\n` +
                `🪪 الهوية: \`${receiver.citizenId}\``,
            ephemeral: true
        });
    }

    // =====================================================
    // أوامر الإدارة
    // =====================================================

    if (
        ['bank-give', 'bank-take', 'bank-reset', 'bank-set', 'bank-info']
            .includes(command)
    ) {

        if (
            !interaction.member.permissions.has(
                PermissionFlagsBits.Administrator
            )
        ) {
            return interaction.reply({
                content: '❌ هذا الأمر مخصص للإدارة فقط.',
                ephemeral: true
            });
        }

        const citizenId =
            interaction.options.getString('الهوية');

        const citizen = getCitizen(citizenId);

        if (!citizen) {
            return interaction.reply({
                content: '❌ لم يتم العثور على هذه الهوية.',
                ephemeral: true
            });
        }

        // ==========================
        // bank-info
        // ==========================
        if (command === 'bank-info') {

            const total =
                citizen.cash + citizen.bank;

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('🏦 كشف حساب مواطن')
                        .setColor('#2b2d31')
                        .addFields(
                            {
                                name: '👤 الاسم',
                                value: citizen.name
                            },
                            {
                                name: '🪪 الهوية',
                                value: citizen.citizenId
                            },
                            {
                                name: '💵 الكاش',
                                value: formatMoney(citizen.cash),
                                inline: true
                            },
                            {
                                name: '🏦 البنك',
                                value: formatMoney(citizen.bank),
                                inline: true
                            },
                            {
                                name: '💰 التوتل',
                                value: formatMoney(total),
                                inline: true
                            }
                        )
                ],
                ephemeral: true
            });
        }

        const amount = getAmount(interaction);

        if (
            command !== 'bank-reset' &&
            !validAmount(amount)
        ) {
            return interaction.reply({
                content: '❌ المبلغ غير صحيح.',
                ephemeral: true
            });
        }

        // ==========================
        // إضافة فلوس
        // ==========================
        if (command === 'bank-give') {

            const updated = updateCitizen(citizen.citizenId, {
                bank: citizen.bank + amount
            });

            addTransaction(citizen.citizenId, {
                type: 'إضافة من الإدارة',
                amount
            });

            return interaction.reply({
                content:
                    `✅ تمت إضافة **${formatMoney(amount)}** إلى بنك ${citizen.name}.\n` +
                    `🏦 الرصيد الجديد: ${formatMoney(updated.bank)}`,
                ephemeral: true
            });
        }

        // ==========================
        // سحب فلوس
        // ==========================
        if (command === 'bank-take') {

            if (amount > citizen.bank) {
                return interaction.reply({
                    content: '❌ رصيد البنك أقل من المبلغ المطلوب.',
                    ephemeral: true
                });
            }

            const updated = updateCitizen(citizen.citizenId, {
                bank: citizen.bank - amount
            });

            addTransaction(citizen.citizenId, {
                type: 'خصم من الإدارة',
                amount
            });

            return interaction.reply({
                content:
                    `✅ تم خصم **${formatMoney(amount)}** من ${citizen.name}.\n` +
                    `🏦 الرصيد الجديد: ${formatMoney(updated.bank)}`,
                ephemeral: true
            });
        }

        // ==========================
        // تصفير
        // ==========================
        if (command === 'bank-reset') {

            updateCitizen(citizen.citizenId, {
                cash: 0,
                bank: 0
            });

            addTransaction(citizen.citizenId, {
                type: 'تصفير الحساب',
                amount: citizen.cash + citizen.bank
            });

            return interaction.reply({
                content:
                    `✅ تم تصفير حساب ${citizen.name}.\n` +
                    `💵 الكاش: 0 ريال\n` +
                    `🏦 البنك: 0 ريال`,
                ephemeral: true
            });
        }

        // ==========================
        // تحديد رصيد البنك
        // ==========================
        if (command === 'bank-set') {

            const updated = updateCitizen(citizen.citizenId, {
                bank: amount
            });

            addTransaction(citizen.citizenId, {
                type: 'تحديد رصيد البنك من الإدارة',
                amount
            });

            return interaction.reply({
                content:
                    `✅ تم تحديد رصيد بنك ${citizen.name} إلى **${formatMoney(updated.bank)}**.`,
                ephemeral: true
            });
        }
    }
}

module.exports = {
    handleBankCommand
};
