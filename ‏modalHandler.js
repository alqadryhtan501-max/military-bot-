async function handleModals(interaction) {

    // 1. معالجة زر إنشاء هوية جديدة
    if (interaction.customId === 'modal_register') {
        const name = interaction.fields.getTextInputValue('name_input');
        const age = interaction.fields.getTextInputValue('age_input');

        // السطر المطلوب: توليد رقم هوية عشوائي مكون من 5 أرقام
        const citizenId = Math.floor(10000 + Math.random() * 90000);

        return interaction.reply({
            embeds: [{
                title: '🪪 تم إصدار بطاقة الهوية بنجاح',
                color: 0x2b2d31,
                fields: [
                    { name: '👤 الاسم', value: name, inline: true },
                    { name: '🎂 العمر', value: age, inline: true },
                    { name: '🆔 رقم الهوية التلقائي', value: `\`${citizenId}\``, inline: false },
                    { name: '📌 صاحب الهوية', value: `<@${interaction.user.id}>`, inline: false }
                ],
                timestamp: new Date()
            }],
            ephemeral: true
        });
    }

    // 2. معالجة مخالفة
    if (interaction.customId === 'modal_fine') {
        const citizenId = interaction.fields.getTextInputValue('id_input');
        const reason = interaction.fields.getTextInputValue('reason_input');
        const amount = interaction.fields.getTextInputValue('amount_input');

        return interaction.reply({
            content: `✅ تم تسجيل المخالفة بنجاح\n\n🪪 رقم الهوية: ${citizenId}\n📋 السبب: ${reason}\n💰 المبلغ: ${amount}`,
            ephemeral: true
        });
    }

    // 3. معالجة إيقاف خدمات
    if (interaction.customId === 'modal_suspend') {
        const citizenId = interaction.fields.getTextInputValue('id_input');
        const reason = interaction.fields.getTextInputValue('reason_input');

        return interaction.reply({
            content: `⛔ تم تسجيل إيقاف الخدمات\n\n🪪 رقم الهوية: ${citizenId}\n📋 السبب: ${reason}`,
            ephemeral: true
        });
    }

    // 4. معالجة تفعيل خدمات
    if (interaction.customId === 'modal_activate') {
        const citizenId = interaction.fields.getTextInputValue('id_input');
        const reason = interaction.fields.getTextInputValue('reason_input');

        return interaction.reply({
            content: `✅ تم تفعيل الخدمات\n\n🪪 رقم الهوية: ${citizenId}\n📋 السبب: ${reason}`,
            ephemeral: true
        });
    }

    // 5. معالجة البحث
    if (interaction.customId === 'modal_search') {
        const citizenId = interaction.fields.getTextInputValue('id_input');

        return interaction.reply({
            content: `🔎 جاري الاستعلام عن المواطن صاحب الهوية: ${citizenId}`,
            ephemeral: true
        });
    }

    // 6. معالجة السجل
    if (interaction.customId === 'modal_history') {
        const citizenId = interaction.fields.getTextInputValue('id_input');

        return interaction.reply({
            content: `📋 سجل المواطن للهوية: ${citizenId}`,
            ephemeral: true
        });
    }
}

module.exports = { handleModals };

