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

    // إنشاء حساب المستخدم إذا غير موجود
    citizens.createUser(userId);

    const characters =
        citizens.getCharacters(userId);

    const activeCharacter =
        citizens.getActiveCharacter(userId);


    // =================================================
    // وصف اللوحة
    // =================================================

    let description =
        'من هنا تقدر تدير شخصياتك وتدخل وتخرج منها.\n\n';

    if (characters.length === 0) {

        description +=
            '❌ لا توجد لديك أي شخصية حالياً.\n\n';

        description +=
            'اضغط **إنشاء شخصية** لإنشاء شخصيتك الأولى.';

    } else {

        description +=
            `👤 عدد الشخصيات: **${characters.length}**\n\n`;

        if (activeCharacter) {

            description +=
                `🟢 الشخصية الحالية: **${activeCharacter.name}**\n`;

            description +=
                `🆔 الهوية: **${activeCharacter.citizenId}**`;

        } else {

            description +=
                '🔴 لا توجد شخصية مسجل دخول بها حالياً.';
        }
    }


    // =================================================
    // Embed
    // =================================================

    const embed =
        new EmbedBuilder()
            .setTitle('🎭 نظام الشخصيات')
            .setDescription(description)
            .setColor('#2b2d31')
            .setTimestamp();


    // =================================================
    // الأزرار
    // =================================================

    const row1 =
        new ActionRowBuilder()
            .addComponents(

                new ButtonBuilder()
                    .setCustomId('character_create')
                    .setLabel('إنشاء شخصية')
                    .setEmoji('➕')
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId('character_login')
                    .setLabel('تسجيل دخول')
                    .setEmoji('🔐')
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId('character_logout')
                    .setLabel('تسجيل خروج')
                    .setEmoji('🚪')
                    .setStyle(ButtonStyle.Secondary)

            );


    const row2 =
        new ActionRowBuilder()
            .addComponents(

                new ButtonBuilder()
                    .setCustomId('character_identity')
                    .setLabel('عرض الهوية')
                    .setEmoji('🪪')
                    .setStyle(ButtonStyle.Secondary)

            );


    return interaction.reply({

        embeds: [embed],

        components: [
            row1,
            row2
        ]

    });
}


// =====================================================
// أزرار الشخصيات
// =====================================================

async function handleCharacterButtons(interaction) {

    const customId =
        interaction.customId;

    const userId =
        interaction.user.id;


    // =================================================
    // إنشاء شخصية
    // =================================================

    if (
        customId === 'character_create'
    ) {

        const modal =
            new ModalBuilder()
                .setCustomId(
                    'character_create_modal'
                )
                .setTitle(
                    '🪪 إنشاء شخصية'
                );


        // الاسم
        const nameInput =
            new TextInputBuilder()
                .setCustomId(
                    'character_name'
                )
                .setLabel(
                    'اسم الشخصية'
                )
                .setPlaceholder(
                    'مثال: محمد أحمد'
                )
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(true)
                .setMinLength(2)
                .setMaxLength(50);


        // اسم حساب السوني
        const psnInput =
            new TextInputBuilder()
                .setCustomId(
                    'character_psn'
                )
                .setLabel(
                    'اسم حساب السوني'
                )
                .setPlaceholder(
                    'مثال: Taha_123'
                )
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(true)
                .setMinLength(2)
                .setMaxLength(30);


        // تاريخ الميلاد
        const birthDateInput =
            new TextInputBuilder()
                .setCustomId(
                    'character_birth_date'
                )
                .setLabel(
                    'تاريخ الميلاد'
                )
                .setPlaceholder(
                    'مثال: 20/05/2001'
                )
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(true)
                .setMinLength(8)
                .setMaxLength(10);


        // مكان الولادة
        const birthPlaceInput =
            new TextInputBuilder()
                .setCustomId(
                    'character_birth_place'
                )
                .setLabel(
                    'مكان الولادة'
                )
                .setPlaceholder(
                    'مثال: جدة'
                )
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(true)
                .setMinLength(2)
                .setMaxLength(50);


        // الجنس
        const genderInput =
            new TextInputBuilder()
                .setCustomId(
                    'character_gender'
                )
                .setLabel(
                    'الجنس'
                )
                .setPlaceholder(
                    'ذكر / أنثى'
                )
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(true)
                .setMinLength(2)
                .setMaxLength(10);


        modal.addComponents(

            new ActionRowBuilder()
                .addComponents(
                    nameInput
                ),

            new ActionRowBuilder()
                .addComponents(
                    psnInput
                ),

            new ActionRowBuilder()
                .addComponents(
                    birthDateInput
                ),

            new ActionRowBuilder()
                .addComponents(
                    birthPlaceInput
                ),

            new ActionRowBuilder()
                .addComponents(
                    genderInput
                )

        );


        return interaction.showModal(modal);
    }


    // =================================================
    // تسجيل الدخول
    // =================================================

    if (
        customId === 'character_login'
    ) {

        const characters =
            citizens.getCharacters(
                userId
            );


        if (
            characters.length === 0
        ) {

            return interaction.reply({

                content:
                    '❌ ما عندك أي شخصية.\n\n' +
                    'أنشئ شخصية أولاً.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        const modal =
            new ModalBuilder()
                .setCustomId(
                    'character_login_modal'
                )
                .setTitle(
                    '🔐 تسجيل دخول'
                );


        const idInput =
            new TextInputBuilder()
                .setCustomId(
                    'character_id'
                )
                .setLabel(
                    'رقم الهوية'
                )
                .setPlaceholder(
                    'اكتب رقم هوية الشخصية'
                )
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(true)
                .setMinLength(5)
                .setMaxLength(5);


        modal.addComponents(

            new ActionRowBuilder()
                .addComponents(
                    idInput
                )

        );


        return interaction.showModal(modal);
    }


    // =================================================
    // تسجيل الخروج
    // =================================================

    if (
        customId === 'character_logout'
    ) {

        const activeCharacter =
            citizens.getActiveCharacter(
                userId
            );


        if (!activeCharacter) {

            return interaction.reply({

                content:
                    '❌ أنت غير مسجل دخول في أي شخصية حالياً.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        /*
         * citizens.js الحالي لا يحتوي على
         * logoutCharacter.
         *
         * لذلك نستخدم setActiveCharacter
         * إذا كان عندك logoutCharacter
         * مستقبلاً نقدر نربطه مباشرة.
         */

        if (
            typeof citizens.logoutCharacter ===
            'function'
        ) {

            citizens.logoutCharacter(
                userId
            );

        } else {

            return interaction.reply({

                content:
                    '⚠️ نظام تسجيل الخروج يحتاج إضافة دالة logoutCharacter في citizens.js.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        return interaction.reply({

            content:
                `🚪 **تم تسجيل الخروج بنجاح.**\n\n` +
                `👤 الشخصية: **${activeCharacter.name}**\n` +
                `🆔 الهوية: \`${activeCharacter.citizenId}\``,

            flags:
                MessageFlags.Ephemeral

        });
    }


    // =================================================
    // عرض الهوية
    // =================================================

    if (
        customId === 'character_identity'
    ) {

        const character =
            citizens.getActiveCharacter(
                userId
            );


        if (!character) {

            return interaction.reply({

                content:
                    '❌ يجب تسجيل الدخول في شخصية أولاً.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        const embed =
            new EmbedBuilder()

                .setTitle(
                    '🪪 بطاقة الهوية'
                )

                .setDescription(
                    `### ${character.name}`
                )

                .addFields(

                    {
                        name: '🪪 رقم الهوية',
                        value:
                            `\`${character.citizenId}\``,
                        inline: true
                    },

                    {
                        name: '👤 الاسم',
                        value:
                            character.name ||
                            'غير محدد',
                        inline: true
                    },

                    {
                        name: '🎮 حساب السوني',
                        value:
                            character.psnName ||
                            'غير محدد',
                        inline: true
                    },

                    {
                        name: '📅 تاريخ الميلاد',
                        value:
                            character.birthDate ||
                            'غير محدد',
                        inline: true
                    },

                    {
                        name: '📍 مكان الولادة',
                        value:
                            character.birthPlace ||
                            'غير محدد',
                        inline: true
                    },

                    {
                        name: '⚧️ الجنس',
                        value:
                            character.gender ||
                            'غير محدد',
                        inline: true
                    }

                )

                .setColor('#2b2d31')
                .setTimestamp();


        return interaction.reply({

            embeds:
                [embed],

            flags:
                MessageFlags.Ephemeral

        });
    }


    // =================================================
    // زر غير معروف
    // =================================================

    return interaction.reply({

        content:
            '❌ زر شخصيات غير معروف.',

        flags:
            MessageFlags.Ephemeral

    });
}


// =====================================================
// Modals الشخصيات
// =====================================================

async function handleCharacterModals(
    interaction
) {

    const customId =
        interaction.customId;

    const userId =
        interaction.user.id;


    // =================================================
    // إنشاء شخصية
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


        const psnName =
            interaction.fields
                .getTextInputValue(
                    'character_psn'
                )
                .trim();


        const birthDate =
            interaction.fields
                .getTextInputValue(
                    'character_birth_date'
                )
                .trim();


        const birthPlace =
            interaction.fields
                .getTextInputValue(
                    'character_birth_place'
                )
                .trim();


        const gender =
            interaction.fields
                .getTextInputValue(
                    'character_gender'
                )
                .trim();


        // =================================================
        // التحقق من الاسم
        // =================================================

        if (
            name.length < 2 ||
            name.length > 50
        ) {

            return interaction.reply({

                content:
                    '❌ اسم الشخصية غير صحيح.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        // =================================================
        // التحقق من حساب السوني
        // =================================================

        if (
            psnName.length < 2 ||
            psnName.length > 30
        ) {

            return interaction.reply({

                content:
                    '❌ اسم حساب السوني غير صحيح.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        // =================================================
        // التحقق من تاريخ الميلاد
        // =================================================

        const birthDateRegex =
            /^\d{2}\/\d{2}\/\d{4}$/;


        if (
            !birthDateRegex.test(
                birthDate
            )
        ) {

            return interaction.reply({

                content:
                    '❌ تاريخ الميلاد غير صحيح.\n\n' +
                    'استخدم الصيغة:\n' +
                    '`DD/MM/YYYY`',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        // =================================================
        // التحقق من التاريخ فعليًا
        // =================================================

        const [
            day,
            month,
            year
        ] =
            birthDate
                .split('/')
                .map(Number);


        const date =
            new Date(
                year,
                month - 1,
                day
            );


        if (
            date.getFullYear() !== year ||
            date.getMonth() !== month - 1 ||
            date.getDate() !== day
        ) {

            return interaction.reply({

                content:
                    '❌ تاريخ الميلاد غير صالح.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        // =================================================
        // التحقق من مكان الولادة
        // =================================================

        if (
            birthPlace.length < 2 ||
            birthPlace.length > 50
        ) {

            return interaction.reply({

                content:
                    '❌ مكان الولادة غير صحيح.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        // =================================================
        // التحقق من الجنس
        // =================================================

        const normalizedGender =
            gender
                .replace(/\s+/g, '')
                .toLowerCase();


        let finalGender;


        if (
            normalizedGender === 'ذكر' ||
            normalizedGender === 'male' ||
            normalizedGender === 'm'
        ) {

            finalGender = 'ذكر';

        } else if (
            normalizedGender === 'أنثى' ||
            normalizedGender === 'انثى' ||
            normalizedGender === 'female' ||
            normalizedGender === 'f'
        ) {

            finalGender = 'أنثى';

        } else {

            return interaction.reply({

                content:
                    '❌ الجنس غير صحيح.\n\n' +
                    'اكتب: **ذكر** أو **أنثى**.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        // =================================================
        // إنشاء الشخصية
        // =================================================

        let character;


        try {

            character =
                citizens.createCharacter(

                    userId,

                    name,

                    birthDate,

                    birthPlace,

                    finalGender,

                    psnName

                );

        } catch (error) {

            console.error(
                '❌ خطأ في إنشاء الشخصية:',
                error
            );

            return interaction.reply({

                content:
                    '❌ حدث خطأ أثناء إنشاء الشخصية.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        if (!character) {

            return interaction.reply({

                content:
                    '❌ تعذر إنشاء الشخصية.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        // =================================================
        // النتيجة
        // =================================================

        return interaction.reply({

            content:

                `✅ **تم إنشاء الشخصية بنجاح!**\n\n` +

                `👤 الاسم: **${character.name}**\n` +

                `🎮 حساب السوني: **${character.psnName}**\n` +

                `📅 تاريخ الميلاد: **${character.birthDate}**\n` +

                `📍 مكان الولادة: **${character.birthPlace}**\n` +

                `⚧️ الجنس: **${character.gender}**\n` +

                `🪪 رقم الهوية: \`${character.citizenId}\`\n\n` +

                `💵 الكاش: **${Number(character.cash || 0).toLocaleString('en-US')} ريال**\n` +

                `🏦 البنك: **${Number(character.bank || 0).toLocaleString('en-US')} ريال**`,

            flags:
                MessageFlags.Ephemeral

        });
    }


    // =================================================
    // تسجيل الدخول
    // =================================================

    if (
        customId ===
        'character_login_modal'
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
                    '❌ هذه الشخصية غير موجودة في حسابك.',

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
                    '❌ تعذر تسجيل الدخول بالشخصية.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        return interaction.reply({

            content:

                `🔐 **تم تسجيل الدخول بنجاح!**\n\n` +

                `👤 الشخصية: **${selected.name}**\n` +

                `🪪 رقم الهوية: \`${selected.citizenId}\`\n` +

                `🎮 حساب السوني: **${selected.psnName || 'غير محدد'}**`,

            flags:
                MessageFlags.Ephemeral

        });
    }


    // =================================================
    // نموذج غير معروف
    // =================================================

    return interaction.reply({

        content:
            '❌ نموذج شخصيات غير معروف.',

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
