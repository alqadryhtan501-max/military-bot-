const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require('discord.js');

async function handleButtons(interaction) {

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

module.exports = {
    handleButtons
};
