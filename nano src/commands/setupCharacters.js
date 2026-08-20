const {
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require('discord.js');

module.exports = {

    async execute(interaction) {

        // =====================================================
        // ✏️ وصف لوحة الهوية
        // =====================================================

        const CHARACTER_DESCRIPTION = `
مرحباً بك في نظام الهوية والشخصيات في LEVEL DREAM.

من القائمة بالأسفل يمكنك إدارة شخصياتك وهوياتك.

➕ إنشاء شخصية
🟢 تسجيل دخول
🔴 تسجيل خروج
📋 شخصياتي
        `;

        // =====================================================
        // 👤 رسالة نظام الهوية
        // =====================================================

        const characterEmbed = new EmbedBuilder()
            .setTitle('🪪 نظام الهوية والشخصيات')
            .setDescription(CHARACTER_DESCRIPTION)
            .setColor('#2b2d31')
            .setTimestamp();

        // =====================================================
        // 📋 قائمة العمليات
        // =====================================================

        const characterMenu = new StringSelectMenuBuilder()
            .setCustomId('character_menu')
            .setPlaceholder('🪪 اختر العملية المطلوبة')
            .addOptions(

                {
                    label: 'إنشاء شخصية',
                    description: 'إنشاء شخصية جديدة وإصدار هوية',
                    value: 'create_character',
                    emoji: '➕'
                },

                {
                    label: 'تسجيل دخول',
                    description: 'تسجيل الدخول بإحدى شخصياتك',
                    value: 'login_character',
                    emoji: '🟢'
                },

                {
                    label: 'تسجيل خروج',
                    description: 'تسجيل الخروج من الشخصية الحالية',
                    value: 'logout_character',
                    emoji: '🔴'
                },

                {
                    label: 'شخصياتي',
                    description: 'عرض جميع الشخصيات والهويات الخاصة بك',
                    value: 'my_characters',
                    emoji: '📋'
                }

            );

        const row = new ActionRowBuilder()
            .addComponents(characterMenu);

        // =====================================================
        // إرسال اللوحة
        // =====================================================

        await interaction.reply({
            content: '✅ تم إرسال لوحة الهوية.',
            ephemeral: true
        });

        await interaction.channel.send({
            embeds: [characterEmbed],
            components: [row]
        });

    }
};
