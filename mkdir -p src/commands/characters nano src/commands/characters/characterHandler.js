const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require('discord.js');

// =====================================================
// قاعدة البيانات
// =====================================================

const database = require('../../database/database');

const {
    createUser,
    getCharacters,
    getActiveCharacter,
    setActiveCharacter,
    createCharacter,
    deleteCharacter
} = database;


// =====================================================
// عرض قائمة الشخصيات
// =====================================================

async function showCharactersMenu(interaction) {

    const discordId = interaction.user.id;

    // إنشاء حساب للمستخدم إذا لم يكن موجودًا
    createUser(discordId);

    const characters = getCharacters(discordId);

    const activeCharacter =
        getActiveCharacter(discordId);


    // =================================================
    // لا توجد شخصيات
    // =================================================

    if (characters.length === 0) {

        const embed = new EmbedBuilder()
            .setTitle('🆔 نظام الشخصيات')
            .setDescription(
                'ليس لديك أي شخصية حاليًا.\n\n' +
                'اضغط على **إنشاء شخصية** لإنشاء شخصيتك الأولى.'
            )
            .setColor('#2b2d31')
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(

                new ButtonBuilder()
                    .setCustomId('character_create')
                    .setLabel('إنشاء شخصية')
                    .setEmoji('➕')
                    .setStyle(ButtonStyle.Success)

            );

        return interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: true
        });
    }


    // =================================================
    // عرض الشخصيات
    // =================================================

    let description = '';

    characters.forEach((character, index) => {

        const isActive =
            activeCharacter &&
            String(character.citizenId) ===
            String(activeCharacter.citizenId);

        description +=
            `**${index + 1}. ${character.name}**\n`;

        description +=
            `🆔 الهوية: \`${character.citizenId}\`\n`;

        description +=
            `🎂 العمر: ${character.age}\n`;

        description +=
            `💵 الكاش: ${Number(character.cash).toLocaleString()} ريال\n`;

        description +=
            `🏦 البنك: ${Number(character.bank).toLocaleString()} ريال\n`;

        description +=
            isActive
                ? '🟢 **الشخصية الحالية**\n\n'
                : '⚪ غير نشطة\n\n';
    });


    // =================================================
    // Embed
    // =================================================

    const embed = new EmbedBuilder()
        .setTitle('🆔 نظام الشخصيات')
        .setDescription(description)
        .setColor('#2b2d31')
        .setFooter({
            text: `عدد الشخصيات: ${characters.length}`
        })
        .setTimestamp();


    // =================================================
    // الأزرار
    // =================================================

    const row1 = new ActionRowBuilder()
        .addComponents(

            new ButtonBuilder()
                .setCustomId('character_create')
                .setLabel('إنشاء شخصية')
                .setEmoji('➕')
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId('character_select')
                .setLabel('اختيار شخصية')
                .setEmoji('🔄')
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId('character_info')
                .setLabel('معلومات الشخصية')
                .setEmoji('📋')
                .setStyle(ButtonStyle.Secondary)

        );


    const row2 = new ActionRowBuilder()
        .addComponents(

            new ButtonBuilder()
                .setCustomId('character_delete')
                .setLabel('حذف شخصية')
                .setEmoji('🗑️')
                .setStyle(ButtonStyle.Danger)

        );


    return interaction.reply({
        embeds: [embed],
        components: [row1, row2],
        ephemeral: true
    });
}


// =====================================================
// أزرار الشخصيات
// =====================================================

async function handleCharacterButtons(interaction) {

    const discordId = interaction.user.id;

    // =================================================
    // إنشاء شخصية
    // =================================================

    if (interaction.customId === 'character_create') {

        const modal = new ModalBuilder()
            .setCustomId('character_create_modal')
            .setTitle('🆔 إنشاء شخصية');


        const nameInput = new TextInputBuilder()
            .setCustomId('character_name')
            .setLabel('اسم الشخصية')
            .setPlaceholder('مثال: محمد عبدالله')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMinLength(2)
            .setMaxLength(100);


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
    // اختيار شخصية
    // =================================================

    if (interaction.customId === 'character_select') {

        const characters = getCharacters(discordId);

        if (characters.length === 0) {

            return interaction.reply({
                content: '❌ لا توجد لديك شخصيات.',
                ephemeral: true
            });
        }


        const rows = [];

        let currentRow =
            new ActionRowBuilder();


        characters.forEach((character, index) => {

            const button =
                new ButtonBuilder()
                    .setCustomId(
                        `character_select_${character.citizenId}`
                    )
                    .setLabel(
                        character.name
                    )
                    .setEmoji('🆔')
                    .setStyle(
                        ButtonStyle.Primary
                    );


            currentRow.addComponents(button);


            // Discord يسمح بـ 5 أزرار في الصف
            if (
                currentRow.components.length === 5 ||
                index === characters.length - 1
            ) {

                rows.push(currentRow);

                currentRow =
                    new ActionRowBuilder();
            }

        });


        return interaction.reply({
            content:
                'اختر الشخصية التي تريد تفعيلها:',
            components: rows,
            ephemeral: true
        });
    }


    // =================================================
    // تفعيل الشخصية
    // =================================================

    if (
        interaction.customId.startsWith(
            'character_select_'
        )
    ) {

        const citizenId =
            interaction.customId.replace(
                'character_select_',
                ''
            );


        const character =
            setActiveCharacter(
                discordId,
                citizenId
            );


        if (!character) {

            return interaction.reply({
                content:
                    '❌ لم يتم العثور على الشخصية.',
                ephemeral: true
            });
        }


        return interaction.update({

            content:
                `🟢 تم تفعيل الشخصية بنجاح.\n\n` +
                `👤 **الاسم:** ${character.name}\n` +
                `🆔 **الهوية:** \`${character.citizenId}\`\n` +
                `💵 **الكاش:** ${Number(character.cash).toLocaleString()} ريال\n` +
                `🏦 **البنك:** ${Number(character.bank).toLocaleString()} ريال`,

            embeds: [],
            components: []

        });
    }


    // =================================================
    // معلومات الشخصية
    // =================================================

    if (interaction.customId === 'character_info') {

        const character =
            getActiveCharacter(discordId);


        if (!character) {

            return interaction.reply({
                content:
                    '❌ لا توجد شخصية نشطة حاليًا.',
                ephemeral: true
            });
        }


        const embed = new EmbedBuilder()
            .setTitle('📋 معلومات الشخصية')
            .setDescription(

                `👤 **الاسم:** ${character.name}\n` +

                `🆔 **رقم الهوية:** ` +
                `\`${character.citizenId}\`\n` +

                `🎂 **العمر:** ${character.age}\n\n` +

                `💵 **الكاش:** ` +
                `${Number(character.cash).toLocaleString()} ريال\n` +

                `🏦 **البنك:** ` +
                `${Number(character.bank).toLocaleString()} ريال\n\n` +

                `💼 **الوظيفة:** ` +
                `${character.job || 'لا يوجد'}\n` +

                `⭐ **الرتبة:** ` +
                `${character.rank || 'لا يوجد'}\n` +

                `🏆 **النقاط:** ` +
                `${character.points || 0}\n\n` +

                `🛑 **إيقاف الخدمات:** ` +
                `${
                    character.servicesSuspended
                        ? 'نعم'
                        : 'لا'
                }`

            )
            .setColor('#2b2d31')
            .setTimestamp();


        return interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    }


    // =================================================
    // حذف شخصية
    // =================================================

    if (interaction.customId === 'character_delete') {

        const characters =
            getCharacters(discordId);


        if (characters.length === 0) {

            return interaction.reply({
                content:
                    '❌ لا توجد شخصيات لحذفها.',
                ephemeral: true
            });
        }


        const rows = [];

        let currentRow =
            new ActionRowBuilder();


        characters.forEach((character, index) => {

            const button =
                new ButtonBuilder()
                    .setCustomId(
                        `character_delete_${character.citizenId}`
                    )
                    .setLabel(
                        character.name
                    )
                    .setEmoji('🗑️')
                    .setStyle(
                        ButtonStyle.Danger
                    );


            currentRow.addComponents(button);


            if (
                currentRow.components.length === 5 ||
                index === characters.length - 1
            ) {

                rows.push(currentRow);

                currentRow =
                    new ActionRowBuilder();
            }

        });


        return interaction.reply({

            content:
                '⚠️ اختر الشخصية التي تريد حذفها:',

            components: rows,

            ephemeral: true
        });
    }


    // =================================================
    // تنفيذ حذف الشخصية
    // =================================================

    if (
        interaction.customId.startsWith(
            'character_delete_'
        )
    ) {

        const citizenId =
            interaction.customId.replace(
                'character_delete_',
                ''
            );


        const characters =
            getCharacters(discordId);


        const character =
            characters.find(
                character =>
                    String(
                        character.citizenId
                    ) ===
                    String(citizenId)
            );


        if (!character) {

            return interaction.reply({
                content:
                    '❌ لم يتم العثور على الشخصية.',
                ephemeral: true
            });
        }


        const deleted =
            deleteCharacter(
                discordId,
                citizenId
            );


        if (!deleted) {

            return interaction.reply({
                content:
                    '❌ فشل حذف الشخصية.',
                ephemeral: true
            });
        }


        return interaction.update({

            content:
                `🗑️ تم حذف الشخصية **${deleted.name}** بنجاح.`,

            embeds: [],

            components: []

        });
    }
}


// =====================================================
// Modals
// =====================================================

async function handleCharacterModals(interaction) {

    const discordId = interaction.user.id;


    // =================================================
    // إنشاء شخصية
    // =================================================

    if (
        interaction.customId ===
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


        const age = Number(ageText);


        // =================================================
        // التحقق من الاسم
        // =================================================

        if (name.length < 2) {

            return interaction.reply({
                content:
                    '❌ الاسم غير صحيح.',
                ephemeral: true
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
                    '❌ العمر غير صحيح. يجب أن يكون بين 1 و100.',
                ephemeral: true
            });
        }


        // =================================================
        // إنشاء الشخصية
        // =================================================

        const character =
            createCharacter(
                discordId,
                name,
                age
            );


        if (!character) {

            return interaction.reply({
                content:
                    '❌ حدث خطأ أثناء إنشاء الشخصية.',
                ephemeral: true
            });
        }


        let message =

            `✅ **تم إنشاء الشخصية بنجاح!**\n\n` +

            `👤 الاسم: **${character.name}**\n` +

            `🆔 رقم الهوية: ` +
            `\`${character.citizenId}\`\n` +

            `🎂 العمر: ${character.age}\n` +

            `💵 الكاش: ` +
            `${Number(character.cash).toLocaleString()} ريال\n` +

            `🏦 البنك: ` +
            `${Number(character.bank).toLocaleString()} ريال`;


        if (character.active) {

            message +=
                '\n\n🟢 تم تعيينها كشخصيتك الحالية.';
        }


        return interaction.reply({

            content: message,

            ephemeral: true

        });
    }
}


// =====================================================
// التصدير
// =====================================================

module.exports = {

    showCharactersMenu,

    handleCharacterButtons,

    handleCharacterModals

};
