const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

module.exports = {

    async execute(interaction) {

        // =====================================================
        // 1. لوحة الميدان
        // =====================================================

        const dutyEmbed = new EmbedBuilder()
            .setTitle('👮 نظام الميدان')
            .setDescription(
                'من هنا يمكنك تسجيل دخولك أو تسجيل خروجك من الميدان.'
            )
            .setColor('#2b2d31')
            .setTimestamp();

        const dutyRow = new ActionRowBuilder()
            .addComponents(

                new ButtonBuilder()
                    .setCustomId('btn_duty_on')
                    .setLabel('تسجيل دخول')
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId('btn_duty_off')
                    .setLabel('تسجيل خروج')
                    .setStyle(ButtonStyle.Danger)

            );


        // =====================================================
        // 2. لوحة الهوية والمواطن
        // =====================================================

        const citizenEmbed = new EmbedBuilder()
            .setTitle('🪪 نظام المواطنين')
            .setDescription(
                'جميع خدمات الهوية والاستعلام عن المواطنين.'
            )
            .setColor('#2b2d31')
            .setTimestamp();

        const citizenRow = new ActionRowBuilder()
            .addComponents(

                new ButtonBuilder()
                    .setCustomId('btn_register')
                    .setLabel('🆔 إنشاء هوية')
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId('btn_search')
                    .setLabel('🔎 استعلام عن مواطن')
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId('btn_history')
                    .setLabel('📋 سجل المواطن')
                    .setStyle(ButtonStyle.Secondary)

            );


        // =====================================================
        // 3. لوحة المخالفات والخدمات
        // =====================================================

        const servicesEmbed = new EmbedBuilder()
            .setTitle('⚖️ نظام المخالفات والخدمات')
            .setDescription(
                'إدارة المخالفات وإيقاف وتفعيل الخدمات للمواطنين.'
            )
            .setColor('#2b2d31')
            .setTimestamp();

        const servicesRow = new ActionRowBuilder()
            .addComponents(

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


        // =====================================================
        // إرسال اللوحات
        // =====================================================

        await interaction.reply({
            content: '✅ تم إرسال جميع لوحات الأنظمة بنجاح.',
            ephemeral: true
        });

        // لوحة الميدان
        await interaction.channel.send({
            embeds: [dutyEmbed],
            components: [dutyRow]
        });

        // لوحة المواطنين
        await interaction.channel.send({
            embeds: [citizenEmbed],
            components: [citizenRow]
        });

        // لوحة المخالفات والخدمات
        await interaction.channel.send({
            embeds: [servicesEmbed],
            components: [servicesRow]
        });

    }
};
