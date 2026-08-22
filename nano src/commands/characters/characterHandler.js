const {
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
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

    const userId =
        interaction.user.id;

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
        'من هنا تقدر تدير كركتراتك وتدخل وتخرج منها.\n\n';

    if (characters.length === 0) {

        description +=
            '❌ لا يوجد لديك أي كركتر حالياً.\n\n';

        description +=
            'اختر **Create Character** لإنشاء أول كركتر لك.';

    } else {

        description +=
            `🎭 عدد الكركترات: **${characters.length}/3**\n\n`;

        if (activeCharacter) {

            description +=
                `🟢 الكركتر الحالي: **${activeCharacter.name}**\n`;

            description +=
                `🆔 الرقم: **${activeCharacter.citizenId}**`;

        } else {

            description +=
                '🔴 لا يوجد كركتر مسجل دخول حالياً.';
        }
    }


    // =================================================
    // Embed
    // =================================================

    const embed =
        new EmbedBuilder()
            .setTitle('🎭 نظام الكركترات')
            .setDescription(description)
            .setColor('#2b2d31')
            .setTimestamp();


    // =================================================
    // القائمة الرئيسية
    // =================================================

    const menu =
        new StringSelectMenuBuilder()
            .setCustomId('character_action')
            .setPlaceholder(
                'Choose an action you want to make'
            )
            .addOptions(

                new StringSelectMenuOptionBuilder()
                    .setLabel('Create Character')
                    .setDescription(
                        'إنشاء كركتر جديد'
                    )
                    .setValue('character_create')
                    .setEmoji('➕'),

                new StringSelectMenuOptionBuilder()
                    .setLabel('Character Login')
                    .setDescription(
                        'تسجيل الدخول واختيار الكركتر'
                    )
                    .setValue('character_login')
                    .setEmoji('🔐'),

                new StringSelectMenuOptionBuilder()
                    .setLabel('Character Logout')
                    .setDescription(
                        'تسجيل الخروج من الكركتر الحالي'
                    )
                    .setValue('character_logout')
                    .setEmoji('🚪')
            );


    const row =
        new ActionRowBuilder()
            .addComponents(menu);


    // =================================================
    // إرسال اللوحة
    // =================================================

    return interaction.reply({

        embeds: [embed],

        components: [row]

    });
}


// =====================================================
// التعامل مع القائمة الرئيسية
// =====================================================

async function handleCharacterButtons(interaction) {

    const userId =
        interaction.user.id;

    const value =
        interaction.values
            ? interaction.values[0]
            : interaction.customId;


    // =================================================
    // إنشاء كركتر
    // =================================================

    if (value === 'character_create') {

        const characters =
            citizens.getCharacters(userId);


        // الحد الأقصى 3 كركترات

        if (characters.length >= 3) {

            return interaction.reply({

                content:
                    '❌ وصلت للحد الأقصى.\n\n' +
                    'يمكنك امتلاك **3 كركترات فقط**.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        const modal =
            new ModalBuilder()
                .setCustomId(
                    'character_create_modal'
                )
                .setTitle(
                    '🎭 إنشاء كركتر'
                );


        // =================================================
        // الاسم
        // =================================================

        const nameInput =
            new TextInputBuilder()
                .setCustomId(
                    'character_name'
                )
                .setLabel(
                    'الاسم'
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


        // =================================================
        // PS ID
        // =================================================

        const psIdInput =
            new TextInputBuilder()
                .setCustomId(
                    'character_psid'
                )
                .setLabel(
                    'PS ID'
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


        // =================================================
        // تاريخ الميلاد
        // =================================================

        const birthDateInput =
            new TextInputBuilder()
                .setCustomId(
                    'character_birthdate'
                )
                .setLabel(
                    'تاريخ الميلاد'
                )
                .setPlaceholder(
                    'مثال: 2005-08-21'
                )
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(true)
                .setMinLength(8)
                .setMaxLength(10);


        // =================================================
        // مكان الميلاد
        // =================================================

        const birthPlaceInput =
            new TextInputBuilder()
                .setCustomId(
                    'character_birthplace'
                )
                .setLabel(
                    'مكان الميلاد'
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


        // =================================================
        // الجنس
        // =================================================

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


        /*
         * Modal يحتوي على 5 حقول
         */

        modal.addComponents(

            new ActionRowBuilder()
                .addComponents(nameInput),

            new ActionRowBuilder()
                .addComponents(psIdInput),

            new ActionRowBuilder()
                .addComponents(birthDateInput),

            new ActionRowBuilder()
                .addComponents(birthPlaceInput),

            new ActionRowBuilder()
                .addComponents(genderInput)

        );


        return interaction.showModal(modal);
    }


    // =================================================
    // تسجيل الدخول
    // =================================================

    if (value === 'character_login') {

        const characters =
            citizens.getCharacters(userId);


        if (characters.length === 0) {

            return interaction.reply({

                content:
                    '❌ ما عندك أي كركتر.\n\n' +
                    'أنشئ كركتر أولاً.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        // =================================================
        // عرض جميع الكركترات
        // =================================================

        const options =
            characters
                .slice(0, 3)
                .map(
                    character => {

                        return new StringSelectMenuOptionBuilder()

                            .setLabel(
                                character.name
                            )

                            .setDescription(
                                `رقم الهوية: ${character.citizenId}`
                            )

                            .setValue(
                                String(character.citizenId)
                            )

                            .setEmoji(
                                character.active
                                    ? '🟢'
                                    : '👤'
                            );

                    }
                );


        const menu =
            new StringSelectMenuBuilder()
                .setCustomId(
                    'character_login_select'
                )
                .setPlaceholder(
                    'اختر الكركتر لتسجيل الدخول'
                )
                .addOptions(options);


        const row =
            new ActionRowBuilder()
                .addComponents(menu);


        return interaction.reply({

            content:
                '🔐 **Character Login**\n\n' +
                'اختر الكركتر الذي تريد تسجيل الدخول إليه:',

            components:
                [row],

            flags:
                MessageFlags.Ephemeral

        });
    }


    // =================================================
    // تسجيل الخروج
    // =================================================

    if (value === 'character_logout') {

        const activeCharacter =
            citizens.getActiveCharacter(userId);


        if (!activeCharacter) {

            return interaction.reply({

                content:
                    '❌ أنت غير مسجل دخول في أي كركتر حالياً.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        const loggedOut =
            citizens.logoutCharacter(userId);


        if (!loggedOut) {

            return interaction.reply({

                content:
                    '❌ تعذر تسجيل الخروج.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        return interaction.reply({

            content:
                `🚪 **تم تسجيل الخروج بنجاح.**\n\n` +
                `👤 الكركتر: **${activeCharacter.name}**\n` +
                `🆔 رقم الهوية: \`${activeCharacter.citizenId}\`\n\n` +
                `🔴 أنت الآن غير مسجل دخول بأي كركتر.`,

            flags:
                MessageFlags.Ephemeral

        });
    }


    // =================================================
    // خيار غير معروف
    // =================================================

    return interaction.reply({

        content:
            '❌ خيار غير معروف.',

        flags:
            MessageFlags.Ephemeral

    });
}


// =====================================================
// تسجيل الدخول بكركتر محدد
// =====================================================

async function handleCharacterLogin(
    interaction
) {

    const userId =
        interaction.user.id;

    const citizenId =
        interaction.values[0];


    const characters =
        citizens.getCharacters(userId);


    const character =
        characters.find(

            item =>
                String(item.citizenId) ===
                String(citizenId)

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
                '❌ تعذر تسجيل الدخول بالكركتر.',

            flags:
                MessageFlags.Ephemeral

        });
    }


    return interaction.reply({

        content:
            `🔐 **تم تسجيل الدخول بنجاح!**\n\n` +
            `👤 الكركتر: **${selected.name}**\n` +
            `🆔 رقم الهوية: \`${selected.citizenId}\`\n` +
            `🎮 PS ID: **${selected.psId || 'غير محدد'}**\n` +
            `🎂 تاريخ الميلاد: **${selected.dateOfBirth || 'غير محدد'}**\n` +
            `📍 مكان الميلاد: **${selected.birthPlace || 'غير محدد'}**\n` +
            `⚧️ الجنس: **${selected.gender || 'غير محدد'}**\n\n` +
            `💵 الكاش: **${Number(
                selected.cash || 0
            ).toLocaleString()} ريال**\n` +
            `🏦 البنك: **${Number(
                selected.bank || 0
            ).toLocaleString()} ريال**`,

        flags:
            MessageFlags.Ephemeral

    });
}


// =====================================================
// Modals
// =====================================================

async function handleCharacterModals(
    interaction
) {

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

        // =================================================
        // قراءة البيانات
        // =================================================

        const name =
            interaction.fields
                .getTextInputValue(
                    'character_name'
                )
                .trim();


        const psId =
            interaction.fields
                .getTextInputValue(
                    'character_psid'
                )
                .trim();


        const birthDate =
            interaction.fields
                .getTextInputValue(
                    'character_birthdate'
                )
                .trim();


        const birthPlace =
            interaction.fields
                .getTextInputValue(
                    'character_birthplace'
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

        if (name.length < 2) {

            return interaction.reply({

                content:
                    '❌ الاسم قصير جداً.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        // =================================================
        // التحقق من PS ID
        // =================================================

        if (psId.length < 2) {

            return interaction.reply({

                content:
                    '❌ PS ID غير صحيح.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        // =================================================
        // التحقق من تاريخ الميلاد
        // =================================================

        const dateRegex =
            /^\d{4}-\d{2}-\d{2}$/;


        if (
            !dateRegex.test(birthDate)
        ) {

            return interaction.reply({

                content:
                    '❌ تاريخ الميلاد غير صحيح.\n' +
                    'استخدم الصيغة: **YYYY-MM-DD**',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        const parsedDate =
            new Date(
                `${birthDate}T00:00:00`
            );


        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {

            return interaction.reply({

                content:
                    '❌ تاريخ الميلاد غير صحيح.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        // =================================================
        // التأكد أن التاريخ فعلاً مطابق
        // =================================================

        const [
            year,
            month,
            day
        ] =
            birthDate
                .split('-')
                .map(Number);


        if (
            parsedDate.getFullYear() !== year ||
            parsedDate.getMonth() + 1 !== month ||
            parsedDate.getDate() !== day
        ) {

            return interaction.reply({

                content:
                    '❌ تاريخ الميلاد غير صحيح.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        // =================================================
        // مكان الميلاد
        // =================================================

        if (birthPlace.length < 2) {

            return interaction.reply({

                content:
                    '❌ مكان الميلاد غير صحيح.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        // =================================================
        // الجنس
        // =================================================

        const normalizedGender =
            gender.toLowerCase();


        if (
            normalizedGender !== 'ذكر' &&
            normalizedGender !== 'انثى' &&
            normalizedGender !== 'أنثى' &&
            normalizedGender !== 'male' &&
            normalizedGender !== 'female'
        ) {

            return interaction.reply({

                content:
                    '❌ الجنس غير صحيح.\n' +
                    'اكتب: **ذكر** أو **أنثى**',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        // =================================================
        // التأكد من الحد الأقصى
        // =================================================

        const characters =
            citizens.getCharacters(userId);


        if (characters.length >= 3) {

            return interaction.reply({

                content:
                    '❌ لا يمكنك امتلاك أكثر من **3 كركترات**.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        // =================================================
        // إنشاء الكركتر
        // =================================================

        let character;

        try {

            character =
                citizens.createCharacter(
                    userId,
                    name,
                    psId,
                    birthDate,
                    birthPlace,
                    gender
                );

        } catch (error) {

            console.error(
                '❌ خطأ في إنشاء الكركتر:',
                error
            );

            return interaction.reply({

                content:
                    '❌ تعذر إنشاء الكركتر.\n' +
                    'تأكد من صحة البيانات.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        // =================================================
        // فشل الإنشاء
        // =================================================

        if (!character) {

            return interaction.reply({

                content:
                    '❌ تعذر إنشاء الكركتر.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        // =================================================
        // نجاح
        // =================================================

        return interaction.reply({

            content:
                `✅ **تم إنشاء الكركتر بنجاح!**\n\n` +
                `👤 الاسم: **${character.name}**\n` +
                `🎮 PS ID: **${character.psId}**\n` +
                `🎂 تاريخ الميلاد: **${character.dateOfBirth}**\n` +
                `📍 مكان الميلاد: **${character.birthPlace}**\n` +
                `⚧️ الجنس: **${character.gender}**\n` +
                `🆔 رقم الهوية: \`${character.citizenId}\`\n\n` +
                `🔴 لم يتم تسجيل الدخول تلقائياً.\n` +
                `استخدم **Character Login** للدخول.`,

            flags:
                MessageFlags.Ephemeral

        });
    }


    // =================================================
    // Modal غير معروف
    // =================================================

    return interaction.reply({

        content:
            '❌ نموذج كركتر غير معروف.',

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

    handleCharacterLogin,

    handleCharacterModals

};
