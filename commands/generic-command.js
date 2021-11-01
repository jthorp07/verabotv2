const {SlashCommandBuilder} = require('@discordjs/builders');
const {CommandInteraction} = require('discord.js');
const {Connection} = require('mysql');

module.exports = {
    data: new SlashCommandBuilder()
            .setName('testcmd'/* ex: 'ping' for /ping */)
            .setDescription('a generic command'/* description to be displayed in autofill */),
            /*
              For other options:

              .addStringOption(option => {
                option.setName('optionName')
                .setDescription('desc')
                .setRequired(true or false)
              })
            */

    /**
     * 
     * @param {CommandInteraction} interaction 
     * @param {Connection} con 
     */
    async execute(interaction, con) {
        // TODO: Implement command code

        /*
          For fetching options:

          interaction.options.getString('stringOptionName')
        */

    },
    permissions: 'all'
};