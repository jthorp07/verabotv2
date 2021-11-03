const {SlashCommandBuilder} = require('@discordjs/builders');
const {CommandInteraction} = require('discord.js');
const {Connection} = require('mysql');

module.exports = {
    data: new SlashCommandBuilder()
            .setName('rr-delete')
            .setDescription('Deletes the server\'s reactrole message (if one exists)'),

    /**
     * 
     * @param {CommandInteraction} interaction 
     * @param {Connection} con 
     */
    async execute(interaction, con) {
        
        // This might take longer than 3 seconds
        await interaction.deferReply();

        // Make sure a reactrole message exists before trying to delete
        console.log(`  Requesting reactrole message information...`)
        con.query(`SELECT * FROM messages WHERE messageName="reactrole"`, (err, rows) => {

            if (err) {
                console.log('  Error: A MySQL query error occured while fetching data from "messages" table');
                console.log('  -> File: reactrole-delete.js')
                console.log(`    MySQL Error: ${err}`);
                interaction.editReply({content: "Error: An error occured querying the database. Is it down?"});
                return;
            }

            if (rows.length == 0) {
                console.log(`  Error: No reactrole message found\n  Halting command`);
                interaction.editReply({content: "Error: There is no reactrole message to delete."});
            }

            let message = rows[0].messageId;
            let channel = rows[0].channelId;

            // Aight it exists, now find and delete the message
            console.log(`  Reactrole message found`);
            console.log(`  Requesting reactrole message from Discord`);
            interaction.guild.channels.fetch(channel).then(c => {
                if (c.type != "GUILD_TEXT") {
                    // How would this even happen?
                    console.log('  Error: Reactrole channel was not a text channel');
                    interaction.editReply({content: 'Error: The database had bad data... Idk how that happened o-o'});
                    return;
                } 
                c.messages.fetch(message).then(m => {
                    
                    // Well deleting is pretty easy... why can't this whole command just be a one liner >:()
                    m.delete();

                    // Time to wipe the database
                    con.query(`DELETE FROM messages WHERE messageName="reactrole"`, (err) => {
                        if (err) {
                            console.log('  Error: A MySQL query error occured while deleting from "messages" table');
                            console.log('  -> File: reactrole-delete.js')
                            console.log(`    MySQL Error: ${err}`);
                            interaction.editReply({content: "Error: An error occured querying the database. Is it down?"});
                            return;
                        }
                        console.log(`  Reactrole message deleted from database`);
                    });

                    con.query(`DELETE FROM reactroles`, (err) => {
                        if (err) {
                            console.log('  Error: A MySQL query error occured while deleting from "reactroles" table');
                            console.log('  -> File: reactrole-delete.js')
                            console.log(`    MySQL Error: ${err}`);
                            interaction.editReply({content: "Error: An error occured querying the database. Is it down?"});
                            return;
                        }
                        console.log(`  Reactrole data deleted from database`);
                    });

                    // Wrap it up by saying we doneeeeee
                    interaction.editReply({content: "The reactrole message has successfully been deleted"});

                }).catch(err => {
                    // Error fetching message
                    console.log(`  Error: Fetching reactrole message failed`);
                    console.log(`  -> File: reactrole-delete.js`);
                    console.log(`    Error message: ${err}`);
                    interaction.editReply({content: 'Error: The database had bad data... Idk how that happened o-o'});
                    return;
                });
            }).catch(err => {
                // Error fetching channel
                console.log(`  Error: Fetching reactrole channel failed`);
                console.log(`  -> File: reactrole-delete.js`);
                console.log(`    Error message: ${err}`);
                interaction.editReply({content: 'Error: The database had bad data... Idk how that happened o-o'});
                return;
            });

        });

    },
    permissions: 'moderator'
};