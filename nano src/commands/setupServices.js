const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

module.exports = {

    async execute(interaction) {

        // =====================================================
        // ✏️ وصف لوحة المخالفات والخدمات
        // =====================================================

        const SERVICES_DESCRIPTION = `
مرحباً بك في نظام المخالفات والخدمات في LEVEL DREAM.

من هنا يمكنك إدارة المخالفات والخدمات والاستعلام عن المواطنين.

🧾 إصدار مخالفة
⛔ إيقاف خدمات
✅ تفعيل خدمات
🔎 الاستعلام عن مواطن
📋 سجل المواطن
        `;

        // =====================================================
        // ⚖️ رسالة النظام
        // =====================================================

        const servicesEmbed = new EmbedBuilder()
            .setTitle('⚖️ نظام المخالفات والخدمات')
            .setDescription(SERVICES_DESCRIPTION)
            .setColor('#2b2d31')
            .setTimestamp();

        // =====================================================
        // 🧾 الصف الأول
        // =====================================================

        const row1 = new ActionRowBuilder()
            .addComponents(

                new ButtonBuilder()
                    .setCustomId('btn_fine')
                    .setLabel('إصدار مخالفة')
                    .setEmoji('🧾')
                    .setStyle(ButtonStyle.Danger),

                new ButtonBuilder()
                    .setCustomId('btn_suspend')
                    .setLabel('إيقاف خدمات')
                    .setEmoji('⛔')
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId('btn_activate')
                    .setLabel('تفعيل خدمات')
                    .setEmoji('✅')
                    .setStyle(ButtonStyle.Success)

            );

        // =====================================================
        // 🔎 الصف الثاني
        // =====================================================

        const row2 = new ActionRowBuilder()
            .addComponents(

                new ButtonBuilder()
                    .setCustomId('btn_search')
                    .setLabel('استعلام عن مواطن')
                    .setEmoji('🔎')
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId('btn_history')
                    .setLabel('سجل المواطن')
                    .setEmoji('📋')
                    .setStyle(ButtonStyle.Primary)

            );

        // =====================================================
        // إرسال اللوحة
        // =====================================================

        await interaction.reply({
            content: '✅ تم إرسال لوحة المخالفات والخدمات.',
            ephemeral: true
        });

        await interaction.channel.send({
            embeds: [servicesEmbed],
            components: [row1, row2]
        });

    }
};
