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
// لوحة الشخصيات
// =====================================================

async function showCharactersMenu(interaction) {

    const userId = interaction.user.id;

    citizens.createUser(userId);

    const characters = citizens.getCharacters(userId);
    const activeCharacter = citizens.getActiveCharacter(userId);

    let description = 'من هنا تقدر تدير شخصياتك وتختار الشخصية الحالية.\n\n';

    if (characters.length === 0) {

        description += '❌ لا توجد لديك أي شخصية حالياً.\n\n';
        description += 'اضغط **إنشاء شخصية** لإنشاء شخصيتك الأولى.';

    } else {

        description += `👤 عدد الشخصيات: **${characters.length}**\n\n`;

        if (activeCharacter) {

            description += `🟢 الشخصية الحالية: **${activeCharacter.name}**\n`;
            description += `🆔 الهوية: **${activeCharacter.citizenId}**`;

        } else {

            description += '⚠️ لا توجد شخصية محددة حالياً.';

        }
    }

    const embed = new EmbedBuilder()
        .setTitle('🆔 نظام الشخصيات')
        .setDescription(description)
        .setColor('#2b2d31')
        .setTimestamp();

    const row = new ActionRowBuilder();

    row.addComponents(

        new ButtonBuilder()
            .setCustomId('character_create')
            .setLabel('إنشاء شخصية')
            .setEmoji('➕')
            .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
            .setCustomId('character_list')
            .setLabel('شخصياتي')
            .setEmoji('👤')
            .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
            .setCustomId('character_select')
            .setLabel('اختيار شخصية')
            .setEmoji('🔄')
            .setStyle(ButtonStyle.Secondary)

    );

    return interaction.reply({
        embeds: [embed],
        components: [row]
    });
}


// =====================================================
// أزرار الشخصيات
// =====================================================

async function handleCharacterButtons(interaction) {

    const customId = interaction.customId;
    const userId = interaction.user.id;


    // =================================================
    // إنشاء شخصية
    // =================================================

    if (customId === 'character_create') {

        const modal = new ModalBuilder()
            .setCustomId('character_create_modal')
            .setTitle('🆔 إنشاء شخصية');

        const nameInput = new TextInputBuilder()
            .setCustomId('character_name')
            .setLabel('اسم الشخصية')
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
            new ActionRowBuilder().addComponents(nameInput),
            new ActionRowBuilder().addComponents(ageInput)
        );

        return interaction.showModal(modal);
    }


    // =================================================
    // عرض الشخصيات
    // =================================================

    if (customId === 'character_list') {

        const characters = citizens.getCharacters(userId);

        if (characters.length === 0) {

            return interaction.reply({
                content: '❌ ما عندك أي شخصية حالياً.',
                flags: MessageFlags.Ephemeral
            });
        }

        let text = '👤 **شخصياتك:**\n\n';

        for (let index = 0; index < characters.length; index++) {

            const character = characters[index];

            const active = character.active
                ? ' 🟢 **الحالية**'
                : '';

            text += `${index + 1}. **${character.name}**${active}\n`;
            text += `🆔 الهوية: \`${character.citizenId}\`\n`;
            text += `🎂 العمر: ${character.age}\n`;
            text += `💵 الكاش: ${character.cash}\n`;
            text += `🏦 البنك: ${character.bank}\n\n`;
        }

        return interaction.reply({
            content: text,
            flags: MessageFlags.Ephemeral
        });
    }


    // =================================================
    // اختيار شخصية
    // =================================================

    if (customId === 'character_select') {

        const characters = citizens.getCharacters(userId);

        if (characters.length === 0) {

            return interaction.reply({
                content: '❌ ما عندك أي شخصية تختارها.',
                flags: MessageFlags.Ephemeral
            });
        }

        const modal = new ModalBuilder()
            .setCustomId('character_select_modal')
            .setTitle('🔄 اختيار الشخصية');

        const idInput = new TextInputBuilder()
            .setCustomId('character_id')
            .setLabel('رقم الهوية')
            .setPlaceholder('اكتب رقم هوية الشخصية')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMinLength(5)
            .setMaxLength(5);

        modal.addComponents(
            new ActionRowBuilder().addComponents(idInput)
        );

        return interaction.showModal(modal);
    }

    return interaction.reply({
        content: '❌ زر شخصيات غير معروف.',
        flags: MessageFlags.Ephemeral
    });
}


// =====================================================
// Modals الشخصيات
// =====================================================

async function handleCharacterModals(interaction) {

    const customId = interaction.customId;
    const userId = interaction.user.id;


    // =================================================
    // إنشاء شخصية
    // =================================================

    if (customId === 'character_create_modal') {

        const name = interaction.fields
            .getTextInputValue('character_name')
            .trim();

        const ageText = interaction.fields
            .getTextInputValue('character_age')
            .trim();

        const age = Number(ageText);


        if (name.length < 2) {

            return interaction.reply({
                content: '❌ اسم الشخصية قصير جداً.',
                flags: MessageFlags.Ephemeral
            });
        }


        if (!Number.isInteger(age) || age < 1 || age > 100) {

            return interaction.reply({
                content: '❌ العمر غير صحيح.',
                flags: MessageFlags.Ephemeral
            });
        }


        const character = citizens.createCharacter(
            userId,
            name,
            age
        );


        if (!character) {

            return interaction.reply({
                content: '❌ تعذر إنشاء الشخصية.',
                flags: MessageFlags.Ephemeral
            });
        }


        return interaction.reply({

            content:
                `✅ **تم إنشاء الشخصية بنجاح!**\n\n` +
                `👤 الاسم: **${character.name}**\n` +
                `🎂 العمر: **${character.age}**\n` +
                `🆔 رقم الهوية: **${character.citizenId}**\n\n` +
                `💵 الكاش: **${character.cash}**\n` +
                `🏦 البنك: **${character.bank}**`,

            flags: MessageFlags.Ephemeral

        });
    }


    // =================================================
    // اختيار شخصية
    // =================================================

    if (customId === 'character_select_modal') {

        const citizenId = interaction.fields
            .getTextInputValue('character_id')
            .trim();

        const characters = citizens.getCharacters(userId);

        const character = characters.find(
            item =>
                String(item.citizenId) === String(citizenId)
        );


        if (!character) {

            return interaction.reply({
                content: '❌ هذه الشخصية غير موجودة في حسابك.',
                flags: MessageFlags.Ephemeral
            });
        }


        const selected = citizens.setActiveCharacter(
            userId,
            citizenId
        );


        if (!selected) {

            return interaction.reply({
                content: '❌ تعذر اختيار الشخصية.',
                flags: MessageFlags.Ephemeral
            });
        }


        return interaction.reply({

            content:
                `🟢 **تم اختيار الشخصية بنجاح!**\n\n` +
                `👤 الشخصية الحالية: **${selected.name}**\n` +
                `🆔 رقم الهوية: **${selected.citizenId}**\n\n` +
                `💵 الكاش: **${selected.cash}**\n` +
                `🏦 البنك: **${selected.bank}**`,

            flags: MessageFlags.Ephemeral

        });
    }


    return interaction.reply({
        content: '❌ نموذج شخصيات غير معروف.',
        flags: MessageFlags.Ephemeral
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
