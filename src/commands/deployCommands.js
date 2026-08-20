require('dotenv').config();

const {
    REST,
    Routes,
    SlashCommandBuilder,
    PermissionFlagsBits
} = require('discord.js');

const commands = [

    // =========================
    // لوحة المواطنين
    // =========================
    new SlashCommandBuilder()
        .setName('setup-panel')
        .setDescription('إرسال لوحة نظام المواطنين'),

    // =========================
    // البنك
    // =========================
    new SlashCommandBuilder()
        .setName('bank')
        .setDescription('عرض كشف حسابك'),

    new SlashCommandBuilder()
        .setName('deposit')
        .setDescription('إيداع كاش في البنك')
        .addNumberOption(option =>
            option
                .setName('المبلغ')
                .setDescription('المبلغ المراد إيداعه')
                .setRequired(true)
                .setMinValue(1)
        ),

    new SlashCommandBuilder()
        .setName('withdraw')
        .setDescription('سحب فلوس من البنك')
        .addNumberOption(option =>
            option
                .setName('المبلغ')
                .setDescription('المبلغ المراد سحبه')
                .setRequired(true)
                .setMinValue(1)
        ),

    new SlashCommandBuilder()
        .setName('transfer')
        .setDescription('تحويل فلوس من البنك إلى مواطن')
        .addStringOption(option =>
            option
                .setName('الهوية')
                .setDescription('رقم هوية المستلم')
                .setRequired(true)
        )
        .addNumberOption(option =>
            option
                .setName('المبلغ')
                .setDescription('المبلغ')
                .setRequired(true)
                .setMinValue(1)
        ),

    new SlashCommandBuilder()
        .setName('give')
        .setDescription('إعطاء كاش لمواطن')
        .addStringOption(option =>
            option
                .setName('الهوية')
                .setDescription('رقم هوية المستلم')
                .setRequired(true)
        )
        .addNumberOption(option =>
            option
                .setName('المبلغ')
                .setDescription('المبلغ')
                .setRequired(true)
                .setMinValue(1)
        ),

    // =========================
    // أوامر الإدارة
    // =========================
    new SlashCommandBuilder()
        .setName('bank-give')
        .setDescription('إضافة فلوس إلى بنك مواطن')
        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator.toString()
        )
        .addStringOption(option =>
            option
                .setName('الهوية')
                .setDescription('رقم الهوية')
                .setRequired(true)
        )
        .addNumberOption(option =>
            option
                .setName('المبلغ')
                .setDescription('المبلغ')
                .setRequired(true)
                .setMinValue(1)
        ),

    new SlashCommandBuilder()
        .setName('bank-take')
        .setDescription('خصم فلوس من بنك مواطن')
        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator.toString()
        )
        .addStringOption(option =>
            option
                .setName('الهوية')
                .setDescription('رقم الهوية')
                .setRequired(true)
        )
        .addNumberOption(option =>
            option
                .setName('المبلغ')
                .setDescription('المبلغ')
                .setRequired(true)
                .setMinValue(1)
        ),

    new SlashCommandBuilder()
        .setName('bank-reset')
        .setDescription('تصفير الكاش والبنك لمواطن')
        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator.toString()
        )
        .addStringOption(option =>
            option
                .setName('الهوية')
                .setDescription('رقم الهوية')
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('bank-set')
        .setDescription('تحديد رصيد البنك لمواطن')
        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator.toString()
        )
        .addStringOption(option =>
            option
                .setName('الهوية')
                .setDescription('رقم الهوية')
                .setRequired(true)
        )
        .addNumberOption(option =>
            option
                .setName('المبلغ')
                .setDescription('الرصيد الجديد')
                .setRequired(true)
                .setMinValue(0)
        ),

    new SlashCommandBuilder()
        .setName('bank-info')
        .setDescription('عرض كشف حساب مواطن')
        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator.toString()
        )
        .addStringOption(option =>
            option
                .setName('الهوية')
                .setDescription('رقم الهوية')
                .setRequired(true)
        )

].map(command => command.toJSON());

const rest = new REST({ version: '10' })
    .setToken(process.env.DISCORD_TOKEN);

async function deployCommands() {

    try {

        console.log('جاري تسجيل الأوامر...');

        await rest.put(
            Routes.applicationCommands(
                process.env.CLIENT_ID
            ),
            {
                body: commands
            }
        );

        console.log('تم تسجيل جميع الأوامر بنجاح ✅');

    } catch (error) {

        console.error(error);

    }
}

deployCommands();
