const {
    EmbedBuilder
} = require('discord.js');

const {
    getCitizen,
    getCitizenByUserId,
    createCitizen,
    generateCitizenId
} = require('../../utils/citizens');

async function handleModals(interaction) {

    // =====================================================
    // إنشاء هوية
    // =====================================================
    if (interaction.customId === 'modal_register') {

        const name =
            interaction.fields.getTextInputValue('name_input');

        const age =
            interaction.fields.getTextInputValue('age_input');

        // منع الشخص من إصدار أكثر من هوية
        const existingCitizen =
            getCitizenByUserId(interaction.user.id);

        if (existingCitizen) {
            return interaction.reply({
                content:
                    `❌ لديك هوية بالفعل.\n🪪 رقم هويتك: \`${existingCitizen.citizenId}\``,
                ephemeral: true
            });
        }

        const citizenId = generateCitizenId();

        const citizen = createCitizen({
            citizenId,
            userId: interaction.user.id,
            name,
            age
        });

        const embed = new EmbedBuilder()
            .setTitle('🪪 تم إصدار بطاقة الهوية بنجاح')
            .setColor('#2b2d31')
            .addFields(
                {
                    name: '👤 الاسم',
                    value: name,
                    inline: true
                },
                {
                    name: '🎂 العمر',
                    value: age,
                    inline: true
                },
                {
                    name: '🆔 رقم الهوية',
                    value: `\`${citizen.citizenId}\``,
                    inline: false
                },
                {
                    name: '💵 الكاش',
                    value: `${citizen.cash.toLocaleString()} ريال`,
                    inline: true
                },
                {
                    name: '🏦 البنك',
                    value: `${citizen.bank.toLocaleString()} ريال`,
                    inline: true
                }
            )
            .setFooter({
                text: 'تم حفظ بياناتك في النظام'
            })
            .setTimestamp();

        return interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    }

    // =====================================================
    // مخالفة
    // =====================================================
    if (interaction.customId === 'modal_fine') {

        const citizenId =
            interaction.fields.getTextInputValue('id_input');

        const reason =
            interaction.fields.getTextInputValue('reason_input');

        const amount =
            interaction.fields.getTextInputValue('amount_input');

        return interaction.reply({
            content:
                `✅ تم تسجيل المخالفة بنجاح\n\n` +
                `🪪 رقم الهوية: ${citizenId}\n` +
                `📋 السبب: ${reason}\n` +
                `💰 المبلغ: ${amount}`,
            ephemeral: true
        });
    }

    // =====================================================
    // إيقاف خدمات
    // =====================================================
    if (interaction.customId === 'modal_suspend') {

        const citizenId =
            interaction.fields.getTextInputValue('id_input');

        const reason =
            interaction.fields.getTextInputValue('reason_input');

        return interaction.reply({
            content:
                `⛔ تم تسجيل إيقاف الخدمات\n\n` +
                `🪪 رقم الهوية: ${citizenId}\n` +
                `📋 السبب: ${reason}`,
            ephemeral: true
        });
    }

    // =====================================================
    // تفعيل خدمات
    // =====================================================
    if (interaction.customId === 'modal_activate') {

        const citizenId =
            interaction.fields.getTextInputValue('id_input');

        const reason =
            interaction.fields.getTextInputValue('reason_input');

        return interaction.reply({
            content:
                `✅ تم تفعيل الخدمات\n\n` +
                `🪪 رقم الهوية: ${citizenId}\n` +
                `📋 السبب: ${reason}`,
            ephemeral: true
        });
    }

    // =====================================================
    // بحث
    // =====================================================
    if (interaction.customId === 'modal_search') {

        const citizenId =
            interaction.fields.getTextInputValue('id_input');

        const citizen = getCitizen(citizenId);

        if (!citizen) {
            return interaction.reply({
                content: '❌ لم يتم العثور على مواطن بهذه الهوية.',
                ephemeral: true
            });
        }

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('🔎 بيانات المواطن')
                    .setColor('#2b2d31')
                    .addFields(
                        {
                            name: '👤 الاسم',
                            value: citizen.name,
                            inline: true
                        },
                        {
                            name: '🎂 العمر',
                            value: citizen.age,
                            inline: true
                        },
                        {
                            name: '🆔 الهوية',
                            value: citizen.citizenId,
                            inline: true
                        }
                    )
            ],
            ephemeral: true
        });
    }

    // =====================================================
    // السجل
    // =====================================================
    if (interaction.customId === 'modal_history') {

        const citizenId =
            interaction.fields.getTextInputValue('id_input');

        const citizen = getCitizen(citizenId);

        if (!citizen) {
            return interaction.reply({
                content: '❌ لم يتم العثور على المواطن.',
                ephemeral: true
            });
        }

        const history =
            citizen.transactions?.length
                ? citizen.transactions
                    .slice(-10)
                    .reverse()
                    .map((tx, index) =>
                        `${index + 1}. ${tx.type} — ${tx.amount.toLocaleString()} ريال`
                    )
                    .join('\n')
                : 'لا توجد عمليات مسجلة.';

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('📋 سجل المواطن')
                    .setColor('#2b2d31')
                    .setDescription(history)
                    .setFooter({
                        text: `الهوية: ${citizen.citizenId}`
                    })
            ],
            ephemeral: true
        });
    }
}

module.exports = {
    handleModals
};
