const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    MessageFlags
} = require('discord.js');
const database =
    require('../../database/citizenDatabase');
// =====================================================
// عرض الشخصيات
// =====================================================
async function showCharactersMenu(
    interaction
) {
    const discordId =
        interaction.user.id;
    const user =
        database.createUser(discordId);
    const characters =
        database.getCharacters(discordId);
    // =================================================
    // لا توجد شخصيات
    // =================================================
    if (characters.length === 0) {
        const embed =
            new EmbedBuilder()
                .setTitle('🎭 شخصياتك')
                .setDescription(
                    'ليس لديك أي شخصية حالياً.\n\n' +
                    'اضغط الزر بالأسفل لإنشاء شخصية جديدة.'
                )
                .setColor('#2b2d31');
        const row =
            new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(
                            'character_create'
                        )
                        .setLabel(
                            'إنشاء شخصية'
                        )
                        .setEmoji('➕')
                        .setStyle(
                            ButtonStyle.Success
                        )
                );
        return interaction.reply({
            embeds: [embed],
            components: [row],
            flags: MessageFlags.Ephemeral
        });
    }
    // =================================================
    // بناء قائمة الشخصيات
    // =================================================
    let description =
        '';
    characters.forEach(
        (character, index) => {
            const active =
                String(
                    user.activeCharacterId
                ) ===
                String(
                    character.citizenId
                );
            description +=
                `**${index + 1}. ${character.name}**\n` +
                `🆔 ${character.citizenId}\n` +
                `💵 ${character.cash.toLocaleString()} ريال\n` +
                `🏦 ${character.bank.toLocaleString()} ريال\n` +
                `${active ? '🟢 الشخصية الحالية' : '⚪ غير نشطة'}\n\n`;
        }
    );
    const embed =
        new EmbedBuilder()
            .setTitle('🎭 شخصياتك')
            .setDescription(
                description
            )
            .setColor('#2b2d31');
    // =================================================
    // قائمة الاختيار
    // =================================================
    const options =
        characters.map(
            character => ({
                label:
                    character.name
                        .substring(0, 100),
                description:
                    `الهوية: ${character.citizenId}`
                        .substring(0, 100),
                value:
                    String(
                        character.citizenId
                    ),
                emoji:
                    String(
                        user.activeCharacterId
                    ) ===
                    String(
                        character.citizenId
                    )
                        ? '🟢'
                        : '👤'
            })
        );
    const select =
        new StringSelectMenuBuilder()
            .setCustomId(
                'character_select'
            )
            .setPlaceholder(
                'اختر الشخصية التي تريد استخدامها'
            )
            .addOptions(options);
    const selectRow =
        new ActionRowBuilder()
            .addComponents(select);
    // =================================================
    // أزرار
    // =================================================
    const buttons =
        new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(
                        'character_create'
                    )
                    .setLabel(
                        'إنشاء'
                    )
                    .setEmoji('➕')
                    .setStyle(
                        ButtonStyle.Success
                    ),
                new ButtonBuilder()
                    .setCustomId(
                        'character_delete'
                    )
                    .setLabel(
                        'حذف'
                    )
                    .setEmoji('🗑️')
                    .setStyle(
                        ButtonStyle.Danger
                    )
            );
    return interaction.reply({
        embeds: [embed],
        components: [
            selectRow,
            buttons
        ],
        flags: MessageFlags.Ephemeral
    });
}
// =====================================================
// إنشاء Character
// =====================================================
async function showCreateModal(
    interaction
) {
    const modal =
        new ModalBuilder()
            .setCustomId(
                'character_create_modal'
            )
            .setTitle(
                '➕ إنشاء شخصية'
            );
    const nameInput =
        new TextInputBuilder()
            .setCustomId(
                'character_name'
            )
            .setLabel(
                'اسم الشخصية'
            )
            .setPlaceholder(
                'مثال: أحمد محمد'
            )
            .setStyle(
                TextInputStyle.Short
            )
            .setRequired(true)
            .setMinLength(2)
            .setMaxLength(100);
    const ageInput =
        new TextInputBuilder()
            .setCustomId(
                'character_age'
            )
            .setLabel(
                'العمر'
            )
            .setPlaceholder(
                'مثال: 25'
            )
            .setStyle(
                TextInputStyle.Short
            )
            .setRequired(true)
            .setMinLength(1)
            .setMaxLength(3);
    modal.addComponents(
        new ActionRowBuilder()
            .addComponents(
                nameInput
            ),
        new ActionRowBuilder()
            .addComponents(
                ageInput
            )
    );
    return interaction.showModal(
        modal
    );
}
// =====================================================
// معالجة إنشاء Character
// =====================================================
async function createCharacter(
    interaction
) {
    const name =
        interaction.fields.getTextInputValue(
            'character_name'
        );
    const age =
        interaction.fields.getTextInputValue(
            'character_age'
        );
    const parsedAge =
        Number(age);
    if (
        !Number.isInteger(parsedAge) ||
        parsedAge < 1 ||
        parsedAge > 120
    ) {
        return interaction.reply({
            content:
                '❌ العمر غير صحيح.',
            flags:
                MessageFlags.Ephemeral
        });
    }
    try {
        const character =
            database.createCharacter(
                interaction.user.id,
                name,
                parsedAge
            );
        return interaction.reply({
            content:
                `✅ تم إنشاء شخصيتك بنجاح!\n\n` +
                `👤 الاسم: **${character.name}**\n` +
                `🆔 رقم الهوية: **${character.citizenId}**\n` +
                `💵 الكاش: **${character.cash.toLocaleString()} ريال**\n` +
                `🏦 البنك: **${character.bank.toLocaleString()} ريال**`,
            flags:
                MessageFlags.Ephemeral
        });
    } catch (error) {
        console.error(
            'Create Character Error:',
            error
        );
        return interaction.reply({
            content:
                '❌ حدث خطأ أثناء إنشاء الشخصية.',
            flags:
                MessageFlags.Ephemeral
        });
    }
}
// =====================================================
// اختيار Character
// =====================================================
async function selectCharacter(
    interaction
) {
    const citizenId =
        interaction.values[0];
    const character =
        database.setActiveCharacter(
            interaction.user.id,
            citizenId
        );
    if (!character) {
        return interaction.reply({
            content:
                '❌ لم يتم العثور على هذه الشخصية.',
            flags:
                MessageFlags.Ephemeral
        });
    }
    return interaction.reply({
        content:
            `🟢 تم اختيار شخصية **${character.name}**.\n` +
            `🆔 رقم الهوية: **${character.citizenId}**`,
        flags:
            MessageFlags.Ephemeral
    });
}
// =====================================================
// حذف Character
// =====================================================
async function deleteCharacter(
    interaction
) {
    const characters =
        database.getCharacters(
            interaction.user.id
        );
    if (characters.length === 0) {
        return interaction.reply({
            content:
                '❌ لا توجد لديك شخصيات.',
            flags:
                MessageFlags.Ephemeral
        });
    }
    if (characters.length === 1) {
        return interaction.reply({
            content:
                '❌ لا يمكنك حذف شخصيتك الوحيدة.',
            flags:
                MessageFlags.Ephemeral
        });
    }
    const options =
        characters.map(
            character => ({
                label:
                    character.name
                        .substring(0, 100),
                description:
                    `الهوية: ${character.citizenId}`
                        .substring(0, 100),
                value:
                    String(
                        character.citizenId
                    ),
                emoji: '🗑️'
            })
        );
    const select =
        new StringSelectMenuBuilder()
            .setCustomId(
                'character_delete_select'
            )
            .setPlaceholder(
                'اختر الشخصية التي تريد حذفها'
            )
            .addOptions(options);
    const row =
        new ActionRowBuilder()
            .addComponents(select);
    return interaction.reply({
        content:
            '⚠️ اختر الشخصية التي تريد حذفها.\n' +
            'الحذف نهائي.',
        components: [row],
        flags:
            MessageFlags.Ephemeral
    });
}
// =====================================================
// تنفيذ حذف Character
// =====================================================
async function confirmDelete(
    interaction
) {
    const citizenId =
        interaction.values[0];
    const character =
        database.findCharacter(
            citizenId
        );
    if (!character) {
        return interaction.reply({
            content:
                '❌ الشخصية غير موجودة.',
            flags:
                MessageFlags.Ephemeral
        });
    }
    if (
        character.discordId &&
        character.discordId !==
            interaction.user.id
    ) {
        return interaction.reply({
            content:
                '❌ لا يمكنك حذف هذه الشخصية.',
            flags:
                MessageFlags.Ephemeral
        });
    }
    const deleted =
        database.deleteCharacter(
            interaction.user.id,
            citizenId
        );
    if (!deleted) {
        return interaction.reply({
            content:
                '❌ تعذر حذف الشخصية.',
            flags:
                MessageFlags.Ephemeral
        });
    }
    return interaction.reply({
        content:
            `🗑️ تم حذف شخصية **${deleted.name}** نهائيًا.`,
        flags:
            MessageFlags.Ephemeral
    });
}
// =====================================================
// تصدير
// =====================================================
module.exports = {
    showCharactersMenu,
    showCreateModal,
    createCharacter,
    selectCharacter,
    deleteCharacter,
    confirmDelete
};
