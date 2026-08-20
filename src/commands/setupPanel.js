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
        // 2. لوحة المواطنين
        // =====================================================

        const citizenEmbed = new EmbedBuilder()
            .setTitle('🪪 نظام المواطنين')
            .setDescription(
                'خدمات الهوية والاستعلام عن المواطنين.'
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
                'إدارة المخالفات وإيقاف وتفعيل الخدمات.'
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
        // 4. لوحة البنك
        // =====================================================

        const bankEmbed = new EmbedBuilder()
            .setTitle('🏦 البنك')
            .setDescription(
                'اختر العملية البنكية المطلوبة من الأزرار بالأسفل.'
            )
            .setColor('#2b2d31')
            .setTimestamp();

        const bankRow = new ActionRowBuilder()
            .addComponents(

                new ButtonBuilder()
                    .setCustomId('btn_bank_balance')
                    .setLabel('💳 كشف الحساب')
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId('btn_bank_deposit')
                    .setLabel('💵 إيداع')
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId('btn_bank_withdraw')
                    .setLabel('💸 سحب')
                    .setStyle(ButtonStyle.Danger),

                new ButtonBuilder()
                    .setCustomId('btn_bank_transfer')
                    .setLabel('🔄 تحويل')
                    .setStyle(ButtonStyle.Secondary)

            );


        // =====================================================
        // إرسال اللوحات
        // =====================================================

        await interaction.reply({
            content: '✅ تم إرسال جميع لوحات الأنظمة.',
            ephemeral: true
        });


        await interaction.channel.send({
            embeds: [dutyEmbed],
            components: [dutyRow]
        });


        await interaction.channel.send({
            embeds: [citizenEmbed],
            components: [citizenRow]
        });


        await interaction.channel.send({
            embeds: [servicesEmbed],
            components: [servicesRow]
        });


        await interaction.channel.send({
            embeds: [bankEmbed],
            components: [bankRow]
        });

    }
};
