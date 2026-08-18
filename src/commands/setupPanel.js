const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

module.exports = {
    async execute(message) {

        const embed = new EmbedBuilder()
            .setTitle('🏛️ لوحة نظام المواطنين')
            .setDescription(
                'اختر الخدمة المطلوبة من الأزرار بالأسفل.'
            )
            .setColor('#2b2d31')
            .setTimestamp();

        const row1 = new ActionRowBuilder().addComponents(

            new ButtonBuilder()
                .setCustomId('btn_fine')
                .setLabel('🧾 إصدار مخالفة')
                .setStyle(ButtonStyle.Danger),

            new ButtonBuilder()
                .setCustomId('btn_suspend')
                .setLabel('⛔ إيقاف خدمات')
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId('btn_activate')
                .setLabel('✅ تفعيل خدمات')
                .setStyle(ButtonStyle.Success)
        );

        const row2 = new ActionRowBuilder().addComponents(

            new ButtonBuilder()
                .setCustomId('btn_search')
                .setLabel('🔎 استعلام عن مواطن')
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId('btn_history')
                .setLabel('📋 سجل المواطن')
                .setStyle(ButtonStyle.Primary)
        );

        await message.channel.send({
            embeds: [embed],
            components: [row1, row2]
        });
    }
};
