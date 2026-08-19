const {
    EmbedBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require('discord.js');

// مصفوفة حفظ أسماء المتواجدين حالياً في الميدان
if (!global.activeDutyList) {
    global.activeDutyList = [];
}

async function handleButtons(interaction) {
    const memberDisplayName = interaction.member.displayName || interaction.user.username;

    // --- 1. تسجيل دخول الميدان ---
    if (interaction.customId === 'btn_duty_on') {
        if (!global.activeDutyList.includes(memberDisplayName)) {
            global.activeDutyList.push(memberDisplayName);
        } else {
            return interaction.reply({ content: '❌ أنت متواجد في الميدان بالفعل!', ephemeral: true });
        }

        await updateDutyEmbed(interaction);
        return interaction.reply({ content: '🟢 تم تسجيل دخولك للميدان بنجاح.', ephemeral: true });
    }

    // --- 2. تسجيل خروج من الميدان ---
    if (interaction.customId === 'btn_duty_off') {
        if (global.activeDutyList.includes(memberDisplayName)) {
            global.activeDutyList = global.activeDutyList.filter(name => name !== memberDisplayName);
        } else {
            return interaction.reply({ content: '❌ أنت غير مسجل في الميدان حالياً!', ephemeral: true });
        }

        await updateDutyEmbed(interaction);
        return interaction.reply({ content: '🔴 تم تسجيل خروجك من الميدان.', ephemeral: true });
    }

    // --- 3. إنشاء هوية ---
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
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('age_input')
                    .setLabel('العمر')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
            )
        );

        return interaction.showModal(modal);
    }

    // --- 4. إصدار مخالفة ---
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
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('reason_input')
                    .setLabel('سبب المخالفة')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('amount_input')
                    .setLabel('مبلغ المخالفة')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
            )
        );

        return interaction.showModal(modal);
    }

    // --- 5. إيقاف خدمات ---
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
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('reason_input')
                    .setLabel('السبب')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true)
            )
        );

        return interaction.showModal(modal);
    }

    // --- 6. تفعيل خدمات ---
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
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('reason_input')
                    .setLabel('السبب')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true)
            )
        );

        return interaction.showModal(modal);
    }

    // --- 7. استعلام عن مواطن ---
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
            )
        );

        return interaction.showModal(modal);
    }

    // --- 8. سجل المواطن ---
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
            )
        );

        return interaction.showModal(modal);
    }
}

// دالة تحديث قائمة المباشرين (# - Police List)
async function updateDutyEmbed(interaction) {
    const guildIcon = interaction.guild.iconURL({ dynamic: true }) || null;

    let listContent = 'لا يوجد أحد بالميدان حالياً.';
    if (global.activeDutyList.length > 0) {
        listContent = global.activeDutyList
            .map((name, index) => `${index + 1} - ${name} 🟢`)
            .join('\n');
    }

    const liveEmbed = new EmbedBuilder()
        .setTitle('# - Police List')
        .setDescription(listContent)
        .setColor('#2b2d31')
        .setThumbnail(guildIcon);

    if (global.dutyMessage) {
        try {
            await global.dutyMessage.edit({ embeds: [liveEmbed] });
        } catch (e) {
            global.dutyMessage = await interaction.channel.send({ embeds: [liveEmbed] });
        }
    } else {
        global.dutyMessage = await interaction.channel.send({ embeds: [liveEmbed] });
    }
}

module.exports = {
    handleButtons
};
