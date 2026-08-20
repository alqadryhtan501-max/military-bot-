require('dotenv').config();

const {
    REST,
    Routes,
    SlashCommandBuilder,
    PermissionFlagsBits
} = require('discord.js');

const commands = [

    // =====================================================
    // لوحة النظام
    // =====================================================

    new SlashCommandBuilder()
        .setName('setup-panel')
        .setDescription('إرسال لوحات النظام'),


    // =====================================================
    // أوامر إدارة البنك
    // =====================================================

    new SlashCommandBuilder()
        .setName('give')
        .setDescription('إعطاء كاش لمواطن')
        .addStringOption(option =>
            option
                .setName('id')
                .setDescription('رقم هوية المستلم')
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
        .setDescription('إضافة فلوس إلى بنك مواطن')
        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator.toString()
        )
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
        .setDescription('خصم فلوس من بنك مواطن')
        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator.toString()
        )
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
        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator.toString()
        )
        .addStringOption(option =>
            option
                .setName('id')
                .setDescription('رقم الهوية')
                .setRequired(true)
        ),


    new SlashCommandBuilder()
        .setName('bank-set')
        .setDescription('تحديد رصيد بنك مواطن')
        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator.toString()
        )
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
        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator.toString()
        )
        .addStringOption(option =>
            option
                .setName('id')
                .setDescription('رقم الهوية')
                .setRequired(true)
        )

].map(command => command.toJSON());


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

        console.log('تم تسجيل الأوامر في السيرفر بنجاح ✅');

    } catch (error) {

        console.error('حدث خطأ أثناء تسجيل الأوامر:');
        console.error(error);

    }
}

deployCommands();
