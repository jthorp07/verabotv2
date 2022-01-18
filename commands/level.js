const {SlashCommandBuilder} = require('@discordjs/builders');
const {CommandInteraction, MessageEmbed} = require('discord.js');
const {Connection} = require('mysql');
const { CLIENT_MULTI_RESULTS } = require('mysql/lib/protocol/constants/client');

module.exports = {
    data: new SlashCommandBuilder()
            .setName('level')
            .setDescription('Displays the user\'s level and experience'),
    /**
     * 
     * @param {CommandInteraction} interaction 
     * @param {Connection} con 
     */
    async execute(interaction, con) {
      await interaction.deferReply();
      con.query(`SELECT xp, level, needed FROM xp WHERE id='${interaction.member.id}'`, (err, result, fields) => {
        if (err) {
          console.error(err.stack);
          interaction.editReply({content:`Uh oh, something went wrong o-o`});
          return;
        }

        if (result.length == 0) {
          interaction.editReply({content:`You aren't in the database for some reason... o-O\nTry sending some regular messages in the server and try again.`});
          return;
        }

        let embeds = [];
        embeds.push(new MessageEmbed().setTitle(`${interaction.member.user.username}'s Profile`)
            .addField(`Level`,`${result[0].level}`)
            .addField(`XP`,`${result[0].xp}/${result[0].needed}`));

        interaction.editReply({embeds: embeds});
      });

    },
    permissions: 'all'
};