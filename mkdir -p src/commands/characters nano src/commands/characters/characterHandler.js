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
    const active = citizens.getActiveCharacter(userId);

    let description = 'من هنا تقدر تدير شخصياتك وتختار الشخصية الحالية.\n\n';

    if (characters.length === 0) {

        description += '❌ لا توجد لديك أي شخصية حالياً.\n\n';
        description += 'اضغط على **إنشاء شخصية** لإنشاء شخصيتك الأولى.';

    } else {

        description += `👤 عدد الشخصيات: **${characters.length}**\n\n`;

        if (active) {

            description += `🟢 الشخصية الحالية: **${active.name}**\n`;
            description += `🆔 الهوية: **${active.citizenId}**`;

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

    const userId = interaction.user.id;
    const customId = interaction.customId;

    // =================================================
    // إنشاء شخصية
    // =================================================

    if (customId === 'character_create') {

        const characters = citizens.getCharacters(userId);

        if (characters.length >= 3) {

            return interaction.reply({
                content: '❌ الحد الأقصى هو 3 شخصيات.',
                flags: MessageFlags.Ephemeral
            });

        }

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

            new ActionRowBuilder()
                .addComponents(nameInput),

            new ActionRowBuilder()
                .addComponents(ageInput)

        );

        return interaction.showModal(modal);
    }


    // =================================================
    // شخصياتي
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

        for (let i = 0; i < characters.length; i++) {

            const character = characters[i];

            const active = character.active
                ? ' 🟢 **الحالية**'
                : '';

            text += `${i + 1}. **${character.name}**${active}\n`;
            text += `🆔 الهوية: \`${character.citizenId}\`\n`;
            text += `🎂 العمر: ${character.age}\n`;
            text += `💵 الكاش: ${Number(character.cash).toLocaleString()}\n`;
            text += `🏦 البنك: ${Number(character.bank).toLocaleString()}\n`;
            text += '\n';
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
            .setPlaceholder('مثال: 12345')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMinLength(5)
            .setMaxLength(5);

        modal.addComponents(
            new ActionRowBuilder()
                .addComponents(idInput)
        );

        return interaction.showModal(modal);
    }
}


// =====================================================
// Modals الشخصيات
// =====================================================

async function handleCharacterModals(interaction) {

    const userId = interaction.user.id;
    const customId = interaction.customId;


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
                content: '❌ الاسم قصير جداً.',
                flags: MessageFlags.Ephemeral
            });

        }

        if (!Number.isInteger(age) || age < 1 || age > 100) {

            return interaction.reply({
                content: '❌ العمر غير صحيح.',
                flags: MessageFlags.Ephemeral
            });

        }

        const characters = citizens.getCharacters(userId);

        if (characters.length >= 3) {

            return interaction.reply({
                content: '❌ وصلت للحد الأقصى وهو 3 شخصيات.',
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
                '✅ **تم إنشاء الشخصية بنجاح!**\n\n' +
                `👤 الاسم: **${character.name}**\n` +
                `🎂 العمر: **${character.age}**\n` +
                `🆔 رقم الهوية: **${character.citizenId}**\n\n` +
                `💵 الكاش: **${Number(character.cash).toLocaleString()}**\n` +
                `🏦 البنك: **${Number(character.bank).toLocaleString()}**\n\n` +
                `${character.active ? '🟢 أصبحت هذه الشخصية شخصيتك الحالية.' : ''}`,

            flags: MessageFlags.Ephemeral

        });
    }


    // =================================================
    // اختيار الشخصية
    // =================================================

    if (customId === 'character_select_modal') {

        const citizenId = interaction.fields
            .getTextInputValue('character_id')
            .trim();

        if (!/^\d{5}$/.test(citizenId)) {

            return interaction.reply({
                content: '❌ رقم الهوية يجب أن يكون 5 أرقام.',
                flags: MessageFlags.Ephemeral
            });

        }

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
                '🟢 **تم اختيار الشخصية بنجاح!**\n\n' +
                `👤 الشخصية الحالية: **${selected.name}**\n` +
                `🆔 رقم الهوية: **${selected.citizenId}**\n\n` +
                `💵 الكاش: **${Number(selected.cash).toLocaleString()}**\n` +
                `🏦 البنك: **${Number(selected.bank).toLocaleString()}**`,

            flags: MessageFlags.Ephemeral

        });
    }
}


// =====================================================
// تصدير الدوال
// =====================================================

module.exports = {
    showCharactersMenu,
    handleCharacterButtons,
    handleCharacterModals
};
