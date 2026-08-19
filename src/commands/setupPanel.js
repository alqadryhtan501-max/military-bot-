const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('🏛️ لوحة الخدمات والنظام العسكري')
            .setDescription('• اختر الخدمة المطلوبة أو قم بتسجيل الدخول والخروج للميدان من الأزرار بالأسفل.')
            .setColor('#2b2d31')
            .setTimestamp();

        // 1. صف أزرار البصمة (الميدان)
        const dutyRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('btn_duty_on')
                .setLabel('تسجيل دخول')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('btn_duty_off')
                .setLabel('تسجيل خروج')
                .setStyle(ButtonStyle.Danger)
        );

        // 2. الصف الأول لخدمات المواطنين
        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('btn_register')
                .setLabel('🆔 إنشاء هوية')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('btn_fine')
                .setLabel('🧾 إصدار مخالفة')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('btn_suspend')
                .setLabel('⛔ إيقاف خدمات')
                .setStyle(ButtonStyle.Secondary)
        );

        // 3. الصف الثاني لخدمات المواطنين
        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('btn_activate')
                .setLabel('✅ تفعيل خدمات')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('btn_search')
                .setLabel('🔎 استعلام عن مواطن')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('btn_history')
                .setLabel('📋 سجل المواطن')
                .setStyle(ButtonStyle.Primary)
        );

        await interaction.reply({
            embeds: [embed],
            components: [dutyRow, row1, row2]
        });
    }
};
