const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    console.log(`ONLINE: ${client.user.tag}`);
});

client.on('messageCreate', (message) => {
    console.log(`MESSAGE: ${message.content}`);

    if (message.author.bot) return;

    if (message.content === '!test') {
        message.reply('✅ البوت يستقبل الرسائل');
    }
});

client.login(process.env.DISCORD_TOKEN);
