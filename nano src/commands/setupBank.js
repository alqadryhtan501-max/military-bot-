const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

module.exports = {

    async execute(interaction) {

        // =====================================================
        // ✏️ وصف البنك - عدله براحتك
        // =====================================================

        const BANK_DESCRIPTION = `
أي عملية مالية أو نقدية في LEVEL DREAM تتم من خلال البنك المركزي.

يمكنك استخدام الأزرار الموجودة بالأسفل لتنفيذ العمليات البنكية.
        `;

        // =====================================================
        // 🏦 رسالة البنك
        // =====================================================

        const bankEmbed = new EmbedBuilder()
            .setTitle('🏦 البنك المركزي')
            .setDescription(BANK_DESCRIPTION)
            .setColor('#2b2d31')
            .setTimestamp();

        // =====================================================
        // 💰 أزرار البنك
        // =====================================================

        const bankRow = new ActionRowBuilder()
            .addComponents(

                new ButtonBuilder()
                    .setCustomId('btn_bank_balance')
                    .setLabel('Money')
                    .setEmoji('💰')
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId('btn_bank_transfer')
                    .setLabel('Transfer')
                    .setEmoji('🏦')
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId('btn_bank_deposit')
                    .setLabel('Deposit')
                    .setEmoji('💵')
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId('btn_bank_withdraw')
                    .setLabel('Withdraw')
                    .setEmoji('💳')
                    .setStyle(ButtonStyle.Success)

            );

        // =====================================================
        // إرسال لوحة البنك
        // =====================================================

        await interaction.reply({
            content: '✅ تم إرسال لوحة البنك.',
            ephemeral: true
        });

        await interaction.channel.send({
            embeds: [bankEmbed],
            components: [bankRow]
        });

    }
};
