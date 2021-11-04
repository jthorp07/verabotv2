const {SlashCommandBuilder} = require('@discordjs/builders');
const {CommandInteraction} = require('discord.js');
const {Connection} = require('mysql');

module.exports = {
    data: new SlashCommandBuilder()
            .setName('dbquery')
            .setDescription('Queries the bot\'s database and replies with the query\'s response')
            .addStringOption(option => 
              option.setName('query')
              .setDescription('The query to be sent to the database')
              .setRequired(true)
            ),
    /**
     * 
     * @param {CommandInteraction} interaction 
     * @param {Connection} con 
     */
    async execute(interaction, con) {
        // TODO: Implement command code
        await interaction.deferReply();
        con.query(`${interaction.options.getString('query')}`, (err, rows) => {
          if (err) {
            interaction.editReply({content: `Error Querying Database\n\nYour query:\n\`\`\`${interaction.options.getString('query')}\`\`\`\nMySQL Error:\n${err}`});
            return;
          }

          try {
            if (rows.length == 0) {
                interaction.editReply({content: "Nothing here :("});
            } else {
                let newContent = ``;
                rows.forEach(row => {
                    let line = JSON.stringify(row);
                    newContent = `${newContent}\`\`\`${line}\`\`\`\n`
                });
                interaction.editReply({content: `${newContent}`});
            }                
          } catch (err) {
              interaction.editReply({content: ":thumbsup:"});
              return;
          }

          interaction.editReply();

        })
        /*
          For fetching options:

          interaction.options.getString('stringOptionName')
        */

    },
    permissions: 'owner'
};