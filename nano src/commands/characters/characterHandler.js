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
// التعامل مع قائمة الكركترات
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
                        String(character.citizenId)
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
            citizens.getActiveCharacter(userId);


        if (!activeCharacter) {

            return interaction.reply({

                content:
                    '❌ أنت غير مسجل دخول في أي كركتر حالياً.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        /*
         * citizens.js لا يحتوي logoutCharacter.
         *
         * لذلك لا نحاول استدعاء دالة غير موجودة.
         *
         * حالياً setActiveCharacter() مخصص
         * لاختيار شخصية، وليس لتسجيل الخروج.
         *
         * سيتم إضافة نظام Logout بشكل صحيح
         * إلى citizens.js لاحقاً إذا احتجناه.
         */

        return interaction.reply({

            content:
                `ℹ️ الكركتر الحالي هو **${activeCharacter.name}**.\n\n` +
                `🆔 رقم الهوية: \`${activeCharacter.citizenId}\`\n\n` +
                `نظام تسجيل الخروج يحتاج دالة Logout مستقلة في قاعدة البيانات.`,

            flags:
                MessageFlags.Ephemeral

        });
    }


    // =================================================
    // عرض الهوية
    // =================================================

    if (value === 'character_identity') {

        const activeCharacter =
            citizens.getActiveCharacter(userId);


        if (!activeCharacter) {

            return interaction.reply({

                content:
                    '❌ لا يوجد كركتر مسجل دخول حالياً.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        // الوظيفة في citizens.js عبارة عن Object
        const jobName =
            activeCharacter.job &&
            activeCharacter.job.name
                ? activeCharacter.job.name
                : 'لا يوجد';


        const jobRank =
            activeCharacter.job &&
            activeCharacter.job.rank
                ? activeCharacter.job.rank
                : 'لا يوجد';


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
                            String(activeCharacter.age),
                        inline: true
                    },

                    {
                        name: '💵 الكاش',
                        value:
                            `${Number(
                                activeCharacter.cash || 0
                            ).toLocaleString()} ريال`,
                        inline: true
                    },

                    {
                        name: '🏦 البنك',
                        value:
                            `${Number(
                                activeCharacter.bank || 0
                            ).toLocaleString()} ريال`,
                        inline: true
                    },

                    {
                        name: '💼 الوظيفة',
                        value:
                            jobName,
                        inline: true
                    },

                    {
                        name: '⭐ الرتبة',
                        value:
                            jobRank,
                        inline: true
                    },

                    {
                        name: '⛔ حالة الخدمات',
                        value:
                            activeCharacter.servicesSuspended
                                ? 'موقوفة'
                                : 'مفعلة',
                        inline: true
                    },

                    {
                        name: '🧾 المخالفات',
                        value:
                            String(
                                Array.isArray(
                                    activeCharacter.fines
                                )
                                    ? activeCharacter.fines.length
                                    : 0
                            ),
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
            `🆔 الرقم: \`${selected.citizenId}\`\n` +
            `🎂 العمر: **${selected.age}**\n\n` +
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
            age > 120
        ) {

            return interaction.reply({

                content:
                    '❌ العمر غير صحيح.',

                flags:
                    MessageFlags.Ephemeral

            });
        }


        // إنشاء الكركتر

        let character;

        try {

            character =
                citizens.createCharacter(
                    userId,
                    name,
                    age
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
                `💵 الكاش: **${Number(
                    character.cash || 0
                ).toLocaleString()} ريال**\n` +
                `🏦 البنك: **${Number(
                    character.bank || 0
                ).toLocaleString()} ريال**`,

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
            citizens.getActiveCharacter(userId);


        let message =
            `🗑️ **تم حذف الكركتر بنجاح.**\n\n` +
            `👤 المحذوف: **${deleted.name}**\n` +
            `🆔 الرقم: \`${deleted.citizenId}\``;


        if (newActive) {

            message +=
                `\n\n🟢 الكركتر الحالي: **${newActive.name}**\n` +
                `🆔 الرقم: \`${newActive.citizenId}\``;

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
