require('dotenv').config();

const {
    REST,
    Routes,
    SlashCommandBuilder
} = require('discord.js');

const commands = [
    new SlashCommandBuilder()
        .setName('setup-panel')
        .setDescription('إرسال لوحة نظام المواطنين')
].map(command => command.toJSON());

const rest = new REST({ version: '10' })
    .setToken(process.env.DISCORD_TOKEN);

async function deployCommands() {
    try {
        console.log('جاري تسجيل الأمر...');

        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );

        console.log('تم تسجيل الأمر بنجاح ✅');
    } catch (error) {
        console.error(error);
    }
}

deployCommands();
