const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    MessageFlags
} = require('discord.js');

const citizens = require('../../utils/citizens');


// =====================================================
// لوحة الكركترات
// =====================================================

async function showCharactersMenu(interaction) {

    const userId = interaction.user.id;

    // إنشاء حساب المستخدم إذا غير موجود
    citizens.createUser(userId);

    const characters = citizens.getCharacters(userId);
    const activeCharacter = citizens.getActiveCharacter(userId);

    let description =
        'من هنا تقدر تدير كركتراتك وتختار الكركتر الحالي.\n\n';

    if (characters.length === 0) {

        description +=
            '❌ لا يوجد لديك أي كركتر حالياً.\n\n';

        description +=
            'اضغط **إنشاء كركتر** لإنشاء أول كركتر لك.';

    } else {

        description +=
            `👤 عدد الكركترات: **${characters.length}**\n\n`;

        if (activeCharacter) {

            description +=
                `🟢 الكركتر الحالي: **${activeCharacter.name}**\n`;

            description +=
                `🆔 رقم الكركتر: **${activeCharacter.citizenId}**`;

        } else {

            description +=
                '⚠️ لا يوجد كركتر محدد حالياً.';

        }
    }


    const embed = new EmbedBuilder()
        .setTitle('🎭 نظام الكركترات')
        .setDescription(description)
        .setColor('#2b2d31')
        .setTimestamp();


    // =================================================
    // أزرار اللوحة
    // =================================================

    const row = new ActionRowBuilder();

    row.addComponents(

        new ButtonBuilder()
            .setCustomId('character_create')
            .setLabel('إنشاء كركتر')
            .setEmoji('➕')
            .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
            .setCustomId('character_list')
            .setLabel('كركتراتي')
            .setEmoji('👤')
            .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
            .setCustomId('character_select')
            .setLabel('اختيار كركتر')
            .setEmoji('🔄')
            .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
            .setCustomId('character_delete')
            .setLabel('حذف كركتر')
            .setEmoji('🗑️')
            .setStyle(ButtonStyle.Danger)

    );


    return interaction.reply({
        embeds: [embed],
        components: [row]
    });
}


// =====================================================
// أزرار الكركترات
// =====================================================

async function handleCharacterButtons(interaction) {

    const customId = interaction.customId;
    const userId = interaction.user.id;


    // =================================================
    // إنشاء كركتر
    // =================================================

    if (customId === 'character_create') {

        const modal = new ModalBuilder()
            .setCustomId('character_create_modal')
            .setTitle('🎭 إنشاء كركتر');


        const nameInput = new TextInputBuilder()
            .setCustomId('character_name')
            .setLabel('اسم الكركتر')
            .setPlaceholder('مثال: محمد أحمد')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMinLength(2)
            .setMaxLength(50);


        const ageInput = new TextInputBuilder()
            .setCustomId('character_age')
            .setLabel('العمر')
            .setPlaceholder('مثال: 25')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMinLength(1)
            .setMaxLength(3);


        modal.addComponents(

            new ActionRowBuilder()
                .addComponents(nameInput),

            new ActionRowBuilder()
                .addComponents(ageInput)

        );


        return interaction.showModal(modal);
    }


    // =================================================
    // عرض الكركترات
    // =================================================

    if (customId === 'character_list') {

        const characters =
            citizens.getCharacters(userId);


        if (characters.length === 0) {

            return interaction.reply({
                content:
                    '❌ ما عندك أي كركتر حالياً.',
                flags:
                    MessageFlags.Ephemeral
            });
        }


        let text =
            '🎭 **كركتراتك:**\n\n';


        characters.forEach(
            (character, index) => {

                const active =
                    character.active
                        ? ' 🟢 **الحالي**'
                        : '';


                text +=
                    `${index + 1}. **${character.name}**${active}\n`;

                text +=
                    `🆔 رقم الكركتر: \`${character.citizenId}\`\n`;

                text +=
                    `🎂 العمر: ${character.age}\n`;

                text +=
                    `💵 الكاش: ${character.cash}\n`;

                text +=
                    `🏦 البنك: ${character.bank}\n`;

                if (character.job) {

                    text +=
                        `💼 الوظيفة: ${character.job}\n`;

                }

                text += '\n';

            }
        );


        return interaction.reply({
            content: text,
            flags: MessageFlags.Ephemeral
        });
    }


    // =================================================
    // اختيار كركتر
    // =================================================

    if (customId === 'character_select') {

        const characters =
            citizens.getCharacters(userId);


        if (characters.length === 0) {

            return interaction.reply({
                content:
                    '❌ ما عندك أي كركتر تختاره.',
                flags:
                    MessageFlags.Ephemeral
            });
        }


        const modal =
            new ModalBuilder()
                .setCustomId(
                    'character_select_modal'
                )
                .setTitle(
                    '🔄 اختيار كركتر'
                );


        const idInput =
            new TextInputBuilder()
                .setCustomId(
                    'character_id'
                )
                .setLabel(
                    'رقم الكركتر'
                )
                .setPlaceholder(
                    'اكتب رقم الكركتر'
                )
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(true)
                .setMinLength(5)
                .setMaxLength(5);


        modal.addComponents(

            new ActionRowBuilder()
                .addComponents(idInput)

        );


        return interaction.showModal(modal);
    }


    // =================================================
    // حذف كركتر
    // =================================================

    if (customId === 'character_delete') {

        const characters =
            citizens.getCharacters(userId);


        if (characters.length === 0) {

            return interaction.reply({
                content:
                    '❌ ما عندك أي كركتر لحذفه.',
                flags:
                    MessageFlags.Ephemeral
            });
        }


        const modal =
            new ModalBuilder()
                .setCustomId(
                    'character_delete_modal'
                )
                .setTitle(
                    '🗑️ حذف كركتر'
                );


        const idInput =
            new TextInputBuilder()
                .setCustomId(
                    'character_id'
                )
                .setLabel(
                    'رقم الكركتر'
                )
                .setPlaceholder(
                    'اكتب رقم الكركتر الذي تريد حذفه'
                )
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(true)
                .setMinLength(5)
                .setMaxLength(5);


        modal.addComponents(

            new ActionRowBuilder()
                .addComponents(idInput)

        );


        return interaction.showModal(modal);
    }


    // =================================================
    // زر غير معروف
    // =================================================

    return interaction.reply({
        content:
            '❌ زر كركترات غير معروف.',
        flags:
            MessageFlags.Ephemeral
    });
}


// =====================================================
// Modals الكركترات
// =====================================================

async function handleCharacterModals(interaction) {

    const customId =
        interaction.customId;

    const userId =
        interaction.user.id;


    // =================================================
    // إنشاء كركتر
    // =================================================

    if (
        customId ===
        'character_create_modal'
    ) {

        const name =
            interaction.fields
                .getTextInputValue(
                    'character_name'
                )
                .trim();


        const ageText =
            interaction.fields
                .getTextInputValue(
                    'character_age'
                )
                .trim();


        const age =
            Number(ageText);


        // =================================================
        // التحقق من الاسم
        // =================================================

        if (
            name.length < 2
        ) {

            return interaction.reply({
                content:
                    '❌ اسم الكركتر قصير جداً.',
                flags:
                    MessageFlags.Ephemeral
            });
        }


        // =================================================
        // التحقق من العمر
        // =================================================

        if (
            !Number.isInteger(age) ||
            age < 1 ||
            age > 100
        ) {

            return interaction.reply({
                content:
                    '❌ العمر غير صحيح.',
                flags:
                    MessageFlags.Ephemeral
            });
        }


        // =================================================
        // إنشاء الكركتر
        // =================================================

        const character =
            citizens.createCharacter(
                userId,
                name,
                age
            );


        if (!character) {

            return interaction.reply({
                content:
                    '❌ تعذر إنشاء الكركتر.',
                flags:
                    MessageFlags.Ephemeral
            });
        }


        return interaction.reply({

            content:
                `✅ **تم إنشاء الكركتر بنجاح!**\n\n` +
                `👤 الاسم: **${character.name}**\n` +
                `🎂 العمر: **${character.age}**\n` +
                `🆔 رقم الكركتر: **${character.citizenId}**\n\n` +
                `💵 الكاش: **${character.cash}**\n` +
                `🏦 البنك: **${character.bank}**`,

            flags:
                MessageFlags.Ephemeral

        });
    }


    // =================================================
    // اختيار كركتر
    // =================================================

    if (
        customId ===
        'character_select_modal'
    ) {

        const citizenId =
            interaction.fields
                .getTextInputValue(
                    'character_id'
                )
                .trim();


        const characters =
            citizens.getCharacters(
                userId
            );


        const character =
            characters.find(
                item =>
                    String(
                        item.citizenId
                    ) ===
                    String(
                        citizenId
                    )
            );


        if (!character) {

            return interaction.reply({
                content:
                    '❌ هذا الكركتر غير موجود في حسابك.',
                flags:
                    MessageFlags.Ephemeral
            });
        }


        const selected =
            citizens.setActiveCharacter(
                userId,
                citizenId
            );


        if (!selected) {

            return interaction.reply({
                content:
                    '❌ تعذر اختيار الكركتر.',
                flags:
                    MessageFlags.Ephemeral
            });
        }


        return interaction.reply({

            content:
                `🟢 **تم اختيار الكركتر بنجاح!**\n\n` +
                `👤 الكركتر الحالي: **${selected.name}**\n` +
                `🆔 رقم الكركتر: **${selected.citizenId}**\n\n` +
                `💵 الكاش: **${selected.cash}**\n` +
                `🏦 البنك: **${selected.bank}**`,

            flags:
                MessageFlags.Ephemeral

        });
    }


    // =================================================
    // حذف كركتر
    // =================================================

    if (
        customId ===
        'character_delete_modal'
    ) {

        const citizenId =
            interaction.fields
                .getTextInputValue(
                    'character_id'
                )
                .trim();


        const characters =
            citizens.getCharacters(
                userId
            );


        const character =
            characters.find(
                item =>
                    String(
                        item.citizenId
                    ) ===
                    String(
                        citizenId
                    )
            );


        if (!character) {

            return interaction.reply({
                content:
                    '❌ هذا الكركتر غير موجود في حسابك.',
                flags:
                    MessageFlags.Ephemeral
            });
        }


        // =================================================
        // حذف الكركتر
        // =================================================

        const deleted =
            citizens.deleteCharacter(
                userId,
                citizenId
            );


        if (!deleted) {

            return interaction.reply({
                content:
                    '❌ تعذر حذف الكركتر.',
                flags:
                    MessageFlags.Ephemeral
            });
        }


        // =================================================
        // معرفة الكركتر الحالي الجديد
        // =================================================

        const newActive =
            citizens.getActiveCharacter(
                userId
            );


        let message =
            `🗑️ **تم حذف الكركتر بنجاح.**\n\n` +
            `👤 الكركتر المحذوف: **${deleted.name}**\n` +
            `🆔 الرقم: **${deleted.citizenId}**`;


        if (newActive) {

            message +=
                `\n\n🟢 الكركتر الحالي الجديد: **${newActive.name}**`;

        } else {

            message +=
                '\n\n⚠️ لم يعد لديك أي كركتر حالي.';

        }


        return interaction.reply({

            content:
                message,

            flags:
                MessageFlags.Ephemeral

        });
    }


    // =================================================
    // Modal غير معروف
    // =================================================

    return interaction.reply({
        content:
            '❌ نموذج كركترات غير معروف.',
        flags:
            MessageFlags.Ephemeral
    });
}


// =====================================================
// التصدير
// =====================================================

module.exports = {

    showCharactersMenu,

    handleCharacterButtons,

    handleCharacterModals

};
