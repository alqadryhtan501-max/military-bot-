const {
    EmbedBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    MessageFlags
} = require('discord.js');

// =====================================================
// قائمة المتواجدين في الميدان
// =====================================================

if (!global.activeDutyList) {
    global.activeDutyList = [];
}

// =====================================================
// التعامل مع الأزرار
// =====================================================

async function handleButtons(interaction) {

    const member = interaction.member;

    if (!member) {
        return interaction.reply({
            content: '❌ تعذر العثور على بيانات العضو.',
            flags: MessageFlags.Ephemeral
        });
    }

    const memberDisplayName =
        member.displayName || interaction.user.username;

    const userId = interaction.user.id;

    // =====================================================
    // 1. تسجيل دخول الميدان
    // =====================================================

    if (interaction.customId === 'btn_duty_on') {

        const alreadyOnDuty = global.activeDutyList.some(
            officer => officer.userId === userId
        );

        if (alreadyOnDuty) {
            return interaction.reply({
                content: '❌ أنت مسجل دخول في الميدان بالفعل!',
                flags: MessageFlags.Ephemeral
            });
        }

        global.activeDutyList.push({
            userId: userId,
            name: memberDisplayName,
            joinedAt: Date.now()
        });

        // الرد أولاً على الزر حتى لا ينتهي الـ Interaction
        await interaction.reply({
            content: '🟢 تم تسجيل دخولك للميدان بنجاح.',
            flags: MessageFlags.Ephemeral
        });

        // تحديث القائمة بعد الرد
        try {
            await updateDutyEmbed(interaction);
        } catch (error) {
            console.error(
                '❌ خطأ في تحديث قائمة الميدان:',
                error
            );
        }

        return;
    }

    // =====================================================
    // 2. تسجيل خروج من الميدان
    // =====================================================

    if (interaction.customId === 'btn_duty_off') {

        const officerIndex =
            global.activeDutyList.findIndex(
                officer => officer.userId === userId
            );

        if (officerIndex === -1) {
            return interaction.reply({
                content: '❌ أنت غير مسجل في الميدان حالياً!',
                flags: MessageFlags.Ephemeral
            });
        }

        global.activeDutyList.splice(
            officerIndex,
            1
        );

        // الرد أولاً
        await interaction.reply({
            content: '🔴 تم تسجيل خروجك من الميدان.',
            flags: MessageFlags.Ephemeral
        });

        // ثم تحديث القائمة
        try {
            await updateDutyEmbed(interaction);
        } catch (error) {
            console.error(
                '❌ خطأ في تحديث قائمة الميدان:',
                error
            );
        }

        return;
    }

    // =====================================================
    // 3. إنشاء هوية
    // =====================================================

    if (interaction.customId === 'btn_register') {

        const modal = new ModalBuilder()
            .setCustomId('modal_register')
            .setTitle('🆔 إصدار هوية جديدة');

        modal.addComponents(

            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('name_input')
                    .setLabel('الاسم الثلاثي / الشخصية')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMaxLength(100)
            ),

            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('age_input')
                    .setLabel('العمر')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMinLength(1)
                    .setMaxLength(3)
            )

        );

        return interaction.showModal(modal);
    }

    // =====================================================
    // 4. إصدار مخالفة
    // =====================================================

    if (interaction.customId === 'btn_fine') {

        const modal = new ModalBuilder()
            .setCustomId('modal_fine')
            .setTitle('🧾 إصدار مخالفة');

        modal.addComponents(

            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('id_input')
                    .setLabel('رقم الهوية')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMaxLength(20)
            ),

            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('reason_input')
                    .setLabel('سبب المخالفة')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true)
                    .setMaxLength(500)
            ),

            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('amount_input')
                    .setLabel('مبلغ المخالفة')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMaxLength(10)
            )

        );

        return interaction.showModal(modal);
    }

    // =====================================================
    // 5. إيقاف خدمات
    // =====================================================

    if (interaction.customId === 'btn_suspend') {

        const modal = new ModalBuilder()
            .setCustomId('modal_suspend')
            .setTitle('⛔ إيقاف خدمات');

        modal.addComponents(

            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('id_input')
                    .setLabel('رقم الهوية')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMaxLength(20)
            ),

            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('reason_input')
                    .setLabel('السبب')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true)
                    .setMaxLength(500)
            )

        );

        return interaction.showModal(modal);
    }

    // =====================================================
    // 6. تفعيل خدمات
    // =====================================================

    if (interaction.customId === 'btn_activate') {

        const modal = new ModalBuilder()
            .setCustomId('modal_activate')
            .setTitle('✅ تفعيل خدمات');

        modal.addComponents(

            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('id_input')
                    .setLabel('رقم الهوية')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMaxLength(20)
            ),

            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('reason_input')
                    .setLabel('السبب')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true)
                    .setMaxLength(500)
            )

        );

        return interaction.showModal(modal);
    }

    // =====================================================
    // 7. استعلام عن مواطن
    // =====================================================

    if (interaction.customId === 'btn_search') {

        const modal = new ModalBuilder()
            .setCustomId('modal_search')
            .setTitle('🔎 استعلام عن مواطن');

        modal.addComponents(

            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('id_input')
                    .setLabel('رقم الهوية')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMaxLength(20)
            )

        );

        return interaction.showModal(modal);
    }

    // =====================================================
    // 8. سجل المواطن
    // =====================================================

    if (interaction.customId === 'btn_history') {

        const modal = new ModalBuilder()
            .setCustomId('modal_history')
            .setTitle('📋 سجل المواطن');

        modal.addComponents(

            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('id_input')
                    .setLabel('رقم الهوية')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMaxLength(20)
            )

        );

        return interaction.showModal(modal);
    }
}

// =====================================================
// تحديث قائمة الشرطة
// =====================================================

async function updateDutyEmbed(interaction) {

    const guildIcon =
        interaction.guild?.iconURL({
            extension: 'png',
            size: 256
        }) || null;

    let listContent =
        'لا يوجد أحد بالميدان حالياً.';

    if (global.activeDutyList.length > 0) {

        listContent =
            global.activeDutyList
                .map((officer, index) => {
                    return `${index + 1} - ${officer.name} 🟢`;
                })
                .join('\n');
    }

    const liveEmbed = new EmbedBuilder()
        .setTitle('# - Police List')
        .setDescription(listContent)
        .setColor('#2b2d31')
        .setThumbnail(guildIcon)
        .setFooter({
            text: `عدد المتواجدين: ${global.activeDutyList.length}`
        })
        .setTimestamp();

    // =====================================================
    // تحديث الرسالة الحالية
    // =====================================================

    if (global.dutyMessage) {

        try {

            await global.dutyMessage.edit({
                embeds: [liveEmbed]
            });

            return;

        } catch (error) {

            console.log(
                '⚠️ تعذر تعديل رسالة Police List، سيتم إنشاء رسالة جديدة.'
            );

            global.dutyMessage = null;
        }
    }

    // =====================================================
    // إنشاء رسالة جديدة
    // =====================================================

    if (!interaction.channel) {
        return;
    }

    global.dutyMessage =
        await interaction.channel.send({
            embeds: [liveEmbed]
        });
}

// =====================================================
// التصدير
// =====================================================

module.exports = {
    handleButtons
};
