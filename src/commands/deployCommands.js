require('dotenv').config();

const {
    REST,
    Routes,
    SlashCommandBuilder,
    PermissionFlagsBits
} = require('discord.js');

const commands = [

    // ================================
    // لوحات الأنظمة
    // ================================

    new SlashCommandBuilder()
        .setName('setup-duty')
        .setDescription('إرسال لوحة الميدان'),

    new SlashCommandBuilder()
        .setName('setup-citizens')
        .setDescription('إرسال لوحة المواطنين'),

    new SlashCommandBuilder()
        .setName('setup-services')
        .setDescription('إرسال لوحة المخالفات والخدمات'),

    new SlashCommandBuilder()
        .setName('setup-bank')
        .setDescription('إرسال لوحة البنك'),


    // ================================
    // أوامر البنك الإدارية
    // ================================

    new SlashCommandBuilder()
        .setName('give')
        .setDescription('إعطاء كاش لمواطن')
        .addStringOption(option =>
            option
                .setName('id')
                .setDescription('رقم هوية المواطن')
                .setRequired(true)
        )
        .addNumberOption(option =>
            option
                .setName('amount')
                .setDescription('المبلغ')
                .setRequired(true)
                .setMinValue(1)
        ),

    new SlashCommandBuilder()
        .setName('bank-give')
        .setDescription('إضافة مبلغ إلى بنك مواطن')
        .addStringOption(option =>
            option
                .setName('id')
                .setDescription('رقم الهوية')
                .setRequired(true)
        )
        .addNumberOption(option =>
            option
                .setName('amount')
                .setDescription('المبلغ')
                .setRequired(true)
                .setMinValue(1)
        ),

    new SlashCommandBuilder()
        .setName('bank-take')
        .setDescription('سحب مبلغ من بنك مواطن')
        .addStringOption(option =>
            option
                .setName('id')
                .setDescription('رقم الهوية')
                .setRequired(true)
        )
        .addNumberOption(option =>
            option
                .setName('amount')
                .setDescription('المبلغ')
                .setRequired(true)
                .setMinValue(1)
        ),

    new SlashCommandBuilder()
        .setName('bank-reset')
        .setDescription('تصفير حساب مواطن')
        .addStringOption(option =>
            option
                .setName('id')
                .setDescription('رقم الهوية')
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('bank-set')
        .setDescription('تحديد رصيد بنك مواطن')
        .addStringOption(option =>
            option
                .setName('id')
                .setDescription('رقم الهوية')
                .setRequired(true)
        )
        .addNumberOption(option =>
            option
                .setName('amount')
                .setDescription('الرصيد الجديد')
                .setRequired(true)
                .setMinValue(0)
        ),

    new SlashCommandBuilder()
        .setName('bank-info')
        .setDescription('عرض كشف حساب مواطن')
        .addStringOption(option =>
            option
                .setName('id')
                .setDescription('رقم الهوية')
                .setRequired(true)
        )

].map(command => command.toJSON());


// ================================
// تسجيل الأوامر
// ================================

const rest = new REST({ version: '10' })
    .setToken(process.env.DISCORD_TOKEN);

async function deployCommands() {

    try {

        console.log('جاري تسجيل أوامر البوت...');

        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.GUILD_ID
            ),
            {
                body: commands
            }
        );

        console.log('تم تسجيل الأوامر بنجاح ✅');

    } catch (error) {

        console.error('❌ حدث خطأ:');
        console.error(error);

    }
}

deployCommands();
