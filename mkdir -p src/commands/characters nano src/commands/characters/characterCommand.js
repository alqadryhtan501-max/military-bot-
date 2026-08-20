const {
    SlashCommandBuilder
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('characters')
        .setDescription('إدارة شخصياتك'),

    async execute(interaction) {

        const {
            showCharactersMenu
        } = require('./characterHandler');

        return showCharactersMenu(interaction);
    }
};
