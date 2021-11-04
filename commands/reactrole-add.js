const {SlashCommandBuilder} = require('@discordjs/builders');
const {CommandInteraction} = require('discord.js');
const {Connection} = require('mysql');

module.exports = {
    data: new SlashCommandBuilder()
            .setName('rr-add')
            .setDescription('a generic command')
            .addRoleOption(option => 
                option.setName('role')
                .setDescription('The role that will be given upon reacting')
                .setRequired(true)
            )
            .addStringOption(option => 
                option.setName('emoji')
                .setDescription('The emoji that users will react to receive a role')
                .setRequired(true)
            )
            .addStringOption(option => 
                option.setName('role-desc')
                .setDescription('The title for this entry in the embed will be this option')
                .setRequired(true)),

    /**
     * 
     * @param {CommandInteraction} interaction 
     * @param {Connection} con 
     */
    async execute(interaction, con) {
        
        // This might take longer than 3 seconds
        await interaction.deferReply();
        
        // If there isn't a reactrole message we're in trouble
        con.query(`SELECT * FROM messages WHERE messageName = "reactrole"`, (err, rows) => {

            if (err) {
                console.log('  Error: A MySQL query error occured while fetching data from "messages" table');
                console.log('  -> File: reactrole-add.js')
                console.log(`    MySQL Error: ${err}`);
                interaction.editReply({content: "Error: An error occured querying the database. Is it down?"});
                return;
            }

            // If there's no reactrole message there's no need to continue
            if (rows.length == 0) {
                interaction.editReply({content: "Error: No reactrole message exists, use /rr-create first!"});
                console.log('  Error: Reactrole message does not exist\n  Halting command')
                return;
            }

            // Fetching all options since I need to use roleId in hte query and I want them all in the same place
            let role = interaction.options.getRole('role');
            let emoji = interaction.options.getString('emoji');
            let title = interaction.options.getString('role-desc');
            // Used to resolve message
            let channel = rows[0].channelId;
            let message = rows[0].messageId;

            console.log(`  Requesting reactrole data...`)
            con.query(`SELECT * FROM reactroles WHERE roleId="${role.id}" OR emoji="${emoji}"`, (err, rows) => {

                if (err) {
                    console.log('  Error: A MySQL query error occured while fetching data from "reactroles" table');
                    console.log('  -> File: reactrole-add.js')
                    console.log(`    MySQL Error: ${err}`);
                    interaction.editReply({content: "Error: An error occured querying the database. Is it down?"});
                    return;
                }
    
                // If the query returned anything, stuff already exists with the emoji or role
                // This would cause problems if it were allowed to continue because I'm too lazy to make it work
                if (rows.length > 0) {
                    interaction.editReply({content: "Error: Either the emoji or role requested is already in use in this reactrole menu\n(Duplicates aren't allowed)"});
                    console.log('  Error: Duplicate emoji or role found\n  Halting command')
                    return;
                }

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
                            embed.addField(`${title}`, `@${role.name} ==> ${emoji}`);
                            m.edit({embeds:[embed]}).then(msg => {
                                msg.react(emoji);
                            });

                            // Time for more database queries!
                            // JK
                            // well, kinda, still gotta add new data
                            con.query(`INSERT INTO reactroles(roleId, emoji) VALUES("${role.id}", "${emoji}")`, (err, rows) => {

                                if (err) {
                                    console.log('  Error: A MySQL query error occured while inserting data into "reactroles" table');
                                    console.log('  -> File: reactrole-add.js')
                                    console.log(`    MySQL Error: ${err}`);
                                    interaction.editReply({content: "Error: An error occured querying the database. Is it down?"});
                                    return;
                                }
                                // Actually do something with the interaction
                                // Then delete it to prevent clutter
                                interaction.editReply({content: "It should be added!"}).then(reply => {
                                    setTimeout(() => {
                                        reply.delete();
                                    }, 5000)
                                })
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