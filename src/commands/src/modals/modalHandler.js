async function handleModals(interaction) {

    if (interaction.customId === 'modal_fine') {

        const identity = interaction.fields.getTextInputValue('id_input');
        const reason = interaction.fields.getTextInputValue('reason_input');
        const amount = interaction.fields.getTextInputValue('amount_input');

        await interaction.reply({
            content:
                `🧾 **تم تسجيل المخالفة**\n\n` +
                `🪪 الهوية: ${identity}\n` +
                `📋 السبب: ${reason}\n` +
                `💰 المبلغ: ${amount}`,
            ephemeral: true
        });

        return;
    }

    if (interaction.customId === 'modal_suspend') {

        const identity = interaction.fields.getTextInputValue('id_input');
        const reason = interaction.fields.getTextInputValue('reason_input');

        await interaction.reply({
            content:
                `⛔ **تم إيقاف الخدمات**\n\n` +
                `🪪 الهوية: ${identity}\n` +
                `📋 السبب: ${reason}`,
            ephemeral: true
        });

        return;
    }

    if (interaction.customId === 'modal_activate') {

        const identity = interaction.fields.getTextInputValue('id_input');
        const reason = interaction.fields.getTextInputValue('reason_input');

        await interaction.reply({
            content:
                `✅ **تم تفعيل الخدمات**\n\n` +
                `🪪 الهوية: ${identity}\n` +
                `📋 السبب: ${reason}`,
            ephemeral: true
        });

        return;
    }

    if (interaction.customId === 'modal_search') {

        const identity = interaction.fields.getTextInputValue('id_input');

        await interaction.reply({
            content: `🔎 جاري الاستعلام عن المواطن صاحب الهوية: **${identity}**`,
            ephemeral: true
        });

        return;
    }

    if (interaction.customId === 'modal_history') {

        const identity = interaction.fields.getTextInputValue('id_input');

        await interaction.reply({
            content: `📋 جاري جلب سجل المواطن صاحب الهوية: **${identity}**`,
            ephemeral: true
        });

        return;
    }
}

module.exports = {
    handleModals
};
