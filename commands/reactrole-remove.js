const {SlashCommandBuilder} = require('@discordjs/builders');
const {CommandInteraction} = require('discord.js');
const {Connection} = require('mysql');

module.exports = {
    data: new SlashCommandBuilder()
            .setName('rr-remove')
            .setDescription('Removes a reaction from the server\'s reactrole message')
            .addStringOption(option => 
                option.setName('emoji')
                .setDescription('The emoji from the pair that will be removed')
                .setRequired(true)
            ),

    /**
     * 
     * @param {CommandInteraction} interaction 
     * @param {Connection} con 
     */
    async execute(interaction, con) {
        
        // This might take longer than 3 seconds
        await interaction.deferReply();
        /**
         * Steps to implement:
         * 
         * 1. Check for existence of RR message & pair to remove
         * 
         * 2. Fetch old message and make new embed as copy of old embed
         * 
         * 3. Remove field from embed with role & emoji
         * 
         * 4. Edit message (make sure to send new message object with new embed)
         * 
         * 5. Remove old pair from database
         */
        // If there isn't a reactrole message we're in trouble
        console.log(`  Requesting reactrole message information...`)
        con.query(`SELECT * FROM messages WHERE messageName = "reactrole"`, (err, rows) => {

            if (err) {
                console.log('  Error: A MySQL query error occured while fetching data from "messages" table');
                console.log('  -> File: reactrole-remove.js')
                console.log(`    MySQL Error: ${err}`);
                interaction.editReply({content: "Error: An error occured querying the database. Is it down?"});
                return;
            }

            // If there's no reactrole message there's no need to continue
            if (rows.length == 0) {
                interaction.editReply({content: "Error: No reactrole message exists, use /rr-create!"});
                console.log('  Error: Reactrole message does not exist\n  Halting command')
                return;
            }
            console.log(`  Reactrole message found`);

            // Fetching options and message params for fetching
            let emoji = interaction.options.getString('emoji');
            let channel = rows[0].channelId;
            let message = rows[0].messageId;

            console.log(`  Requesting reactrole data...`)
            con.query(`SELECT * FROM reactroles WHERE emoji="${emoji}"`, (err, rows) => {

                if (err) {
                    console.log('  Error: A MySQL query error occured while fetching data from "reactroles" table');
                    console.log('  -> File: reactrole-remove.js')
                    console.log(`    MySQL Error: ${err}`);
                    interaction.editReply({content: "Error: An error occured querying the database. Is it down?"});
                    return;
                }
    
                // If the query returns nothing, there is no pair wit hthe given emoji
                if (rows.length == 0) {
                    interaction.editReply({content: "Error: There is no existing pair with the given emoji"});
                    console.log('  Error: Emoji not found\n  Halting command')
                    return;
                }
                console.log(`  Reactrole data validated`);

                interaction.guild.channels.fetch(channel).then(c => {
                        if (c.type != "GUILD_TEXT") {
                            // How would this even happen?
                            console.log('  Error: Reactrole channel was not a text channel');
                            interaction.editReply({content: 'Error: The database had bad data... Idk how that happened o-o'});
                            return;
                        } 

                        c.messages.fetch(message).then(m => {
                           
                            // Do work on the message here 
                            let embed = m.embeds[0];
                            console.log('  Message resolved');

                            // Deleting the field containing the emoji
                            for (let i = 0; i < embed.fields.length; i++) {
                                if (embed.fields[i].value.includes(emoji)) {
                                    embed.spliceFields(i, 1);
                                    console.log('  Removed target field from message embed');
                                }
                            }
                            m.edit({embeds:[embed]}).then(m => {
                                try {
                                    // God if this works this is such a roundabout route
                                    let emId = m.guild.emojis.resolveId(emoji);
                                    let key = m.reactions.cache.findKey(reaction => reaction.emoji.id == emId);
                                    m.reactions.cache.delete(key);

                                } catch (err) {
                                    console.log(err);
                                    console.log('  Yeah just delete this');
                                    return;
                                }
                            });

                            con.query(`DELETE FROM reactroles WHERE emoji="${emoji}"`, (err) => {
                                if (err) {
                                    console.log('  Error: A MySQL query error occured while deleting from "reactroles" table');
                                    console.log('  -> File: reactrole-remove.js')
                                    console.log(`    MySQL Error: ${err}`);
                                    interaction.editReply({content: "Error: An error occured querying the database. Is it down?"});
                                    return;
                                }
                            });

                            interaction.editReply({content: "The reaction should be removed"}).then(reply => {
                                setTimeout(() => {
                                    reply.delete();
                                }, 5000)
                            });

                        }).catch(err => {
                            // Error fetching message
                            console.log(`  Error: Fetching reactrole message failed`);
                            console.log(`  -> File: reactrole-add.js`);
                            console.log(`    Error message: ${err}`);
                            interaction.editReply({content: 'Error: The database had bad data... Idk how that happened o-o'});
                            return;
                        });
                    }).catch(err => {
                        // Error fetching channel
                        console.log(`  Error: Fetching reactrole channel failed`);
                        console.log(`  -> File: reactrole-add.js`);
                        console.log(`    Error message: ${err}`);
                        interaction.editReply({content: 'Error: The database had bad data... Idk how that happened o-o'});
                        return;
                    });
            });

        });
    },
    permissions: 'moderator'
};