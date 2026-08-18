async function handleModals(interaction) {

    if (interaction.customId === 'modal_fine') {

        const citizenId = interaction.fields.getTextInputValue('id_input');
        const reason = interaction.fields.getTextInputValue('reason_input');
        const amount = interaction.fields.getTextInputValue('amount_input');

        await interaction.reply({
            content:
                `✅ تم تسجيل المخالفة بنجاح\n\n` +
                `🪪 رقم الهوية: ${citizenId}\n` +
                `📋 السبب: ${reason}\n` +
                `💰 المبلغ: ${amount}`,
            ephemeral: true
        });

        return;
    }

    if (interaction.customId === 'modal_suspend') {

        const citizenId = interaction.fields.getTextInputValue('id_input');
        const reason = interaction.fields.getTextInputValue('reason_input');

        await interaction.reply({
            content:
                `⛔ تم تسجيل إيقاف الخدمات\n\n` +
                `🪪 رقم الهوية: ${citizenId}\n` +
                `📋 السبب: ${reason}`,
            ephemeral: true
        });

        return;
    }

    if (interaction.customId === 'modal_activate') {

        const citizenId = interaction.fields.getTextInputValue('id_input');
        const reason = interaction.fields.getTextInputValue('reason_input');

        await interaction.reply({
            content:
                `✅ تم تفعيل الخدمات\n\n` +
                `🪪 رقم الهوية: ${citizenId}\n` +
                `📋 السبب: ${reason}`,
            ephemeral: true
        });

        return;
    }

    if (interaction.customId === 'modal_search') {

        const citizenId = interaction.fields.getTextInputValue('id_input');

        await interaction.reply({
            content: `🔎 جاري الاستعلام عن المواطن صاحب الهوية: ${citizenId}`,
            ephemeral: true
        });

        return;
    }

    if (interaction.customId === 'modal_history') {

        const citizenId = interaction.fields.getTextInputValue('id_input');

        await interaction.reply({
            content: `📋 سجل المواطن للهوية: ${citizenId}`,
            ephemeral: true
        });

        return;
    }
}
