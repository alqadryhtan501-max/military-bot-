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
        'من هنا تقدر تدير كركتراتك وتدخل وتخرج منها.\n\n';

    if (characters.length === 0) {

        description +=
            '❌ لا يوجد لديك أي كركتر حالياً.\n\n';

        description +=
            'اختر **Create Character** لإنشاء أول كركتر لك.';

    } else {

        description +=
            `🎭 عدد الكركترات: **${characters.length}**\n\n`;

        if (activeCharacter) {

            description +=
                `🟢 الكركتر الحالي: **${activeCharacter.name}**\n`;

            description +=
                `🆔 الرقم: **${activeCharacter.citizenId}` +
                '**';

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
                        'لإنشاء كركتر جديد'
                    )
                    .setValue('character_create')
                    .setEmoji('➕'),

                new StringSelectMenuOptionBuilder()
                    .setLabel('Character Login')
                    .setDescription(
                        'لتسجيل الدخول في الكركتر'
                    )
                    .setValue('character_login')
                    .setEmoji('🔐'),

                new StringSelectMenuOptionBuilder()
                    .setLabel('Character Logout')
                    .setDescription(
                        'لتسجيل الخروج من الكركتر الحالي'
                    )
                    .setValue('character_logout')
                    .setEmoji('🚪'),

                new StringSelectMenuOptionBuilder()
                    .setLabel('Show Identity')
                    .setDescription(
                        'لعرض بيانات الكركتر الحالي'
                    )
                    .setValue('character_identity')
                    .setEmoji('🪪'),

                new StringSelectMenuOptionBuilder()
                    .setLabel('Delete Character')
                    .setDescription(
                        'لحذف كركتر'
                    )
                    .setValue('character_delete')
                    .setEmoji('🗑️')

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
// القائمة الرئيسية للكركترات
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

        const modal =
            new ModalBuilder()
                .setCustomId(
                    'character_create_modal'
                )
                .setTitle(
                    '🎭 إنشاء كركتر'
                );


        const nameInput =
            new TextInputBuilder()
                .setCustomId(
                    'character_name'
                )
                .setLabel(
                    'اسم الكركتر'
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
                .addComponents(nameInput),

            new ActionRowBuilder()
                .addComponents(ageInput)

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


        const options =
            characters.map(character => {

                return new StringSelectMenuOptionBuilder()

                    .setLabel(
                        character.name
                    )

                    .setDescription(
                        `رقم الكركتر: ${character.citizenId} | العمر: ${character.age}`
                    )

                    .setValue(
                        String(
                            character.citizenId
                        )
                    )

                    .setEmoji(
                        character.active
                            ? '🟢'
                            : '👤'
                    );

            });


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
            citizens.getActiveCharacter(
                userId
            );


        if (!activeCharacter) {

            return interaction.reply({

                content:
                    '❌ أنت غير مسجل دخول في أي كركتر حالياً.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        // تسجيل الخروج
        if (
            typeof citizens.logoutCharacter ===
            'function'
        ) {

            citizens.logoutCharacter(
                userId
            );

        } else {

            // احتياط إذا لم تكن الدالة موجودة
            citizens.setActiveCharacter(
                userId,
                null
            );

        }


        return interaction.reply({

            content:
                `🚪 تم تسجيل الخروج من الكركتر **${activeCharacter.name}**.`,

            flags:
                MessageFlags.Ephemeral

        });
    }


    // =================================================
    // عرض الهوية
    // =================================================

    if (value === 'character_identity') {

        const activeCharacter =
            citizens.getActiveCharacter(
                userId
            );


        if (!activeCharacter) {

            return interaction.reply({

                content:
                    '❌ لا يوجد كركتر مسجل دخول حالياً.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        const embed =
            new EmbedBuilder()

                .setTitle(
                    '🪪 هوية الكركتر'
                )

                .setDescription(
                    `### ${activeCharacter.name}`
                )

                .addFields(

                    {
                        name: '🆔 رقم الكركتر',
                        value:
                            `\`${activeCharacter.citizenId}\``,
                        inline: true
                    },

                    {
                        name: '🎂 العمر',
                        value:
                            String(
                                activeCharacter.age
                            ),
                        inline: true
                    },

                    {
                        name: '💵 الكاش',
                        value:
                            String(
                                activeCharacter.cash
                            ),
                        inline: true
                    },

                    {
                        name: '🏦 البنك',
                        value:
                            String(
                                activeCharacter.bank
                            ),
                        inline: true
                    },

                    {
                        name: '💼 الوظيفة',
                        value:
                            activeCharacter.job ||
                            'لا يوجد',
                        inline: true
                    },

                    {
                        name: '⭐ الرتبة',
                        value:
                            activeCharacter.rank ||
                            'لا يوجد',
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
    // حذف كركتر
    // =================================================

    if (value === 'character_delete') {

        const characters =
            citizens.getCharacters(
                userId
            );


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
                '❌ تعذر تسجيل الدخول بالكركتر.',

            flags:
                MessageFlags.Ephemeral

        });
    }


    return interaction.reply({

        content:
            `🔐 **تم تسجيل الدخول بنجاح!**\n\n` +
            `👤 الكركتر: **${selected.name}**\n` +
            `🆔 الرقم: \`${selected.citizenId}\`\n` +
            `🎂 العمر: **${selected.age}**`,

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


        // التحقق من الاسم

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


        // التحقق من العمر

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


        // إنشاء الكركتر

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
                `🆔 رقم الكركتر: \`${character.citizenId}\`\n\n` +
                `💵 الكاش: **${character.cash}**\n` +
                `🏦 البنك: **${character.bank}**`,

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


        const newActive =
            citizens.getActiveCharacter(
                userId
            );


        let message =
            `🗑️ **تم حذف الكركتر بنجاح.**\n\n` +
            `👤 المحذوف: **${deleted.name}**\n` +
            `🆔 الرقم: \`${deleted.citizenId}\``;


        if (newActive) {

            message +=
                `\n\n🟢 الكركتر الحالي: **${newActive.name}**`;

        } else {

            message +=
                '\n\n🔴 لا يوجد كركتر مسجل دخول حالياً.';

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
