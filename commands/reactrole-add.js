const {SlashCommandBuilder} = require('@discordjs/builders');
const {CommandInteraction} = require('discord.js');
const {Connection} = require('mysql');

module.exports = {
    data: new SlashCommandBuilder()
            .setName('rr-add'/* ex: 'ping' for /ping */)
            .setDescription('a generic command'/* description to be displayed in autofill */)
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
        /**
         * Steps to implement:
         * 
         * 1. Check for duplicates & existence of RR message
         * 
         * 2. Fetch old message and make new embed as copy of old embed
         * 
         * 3. Add field to embed with role & emoji
         * 
         * 4. Edit message (make sure to send new message object with new embed)
         * 
         * 5. Add new emoji/role to database
         */
        // If there isn't a reactrole message we're in trouble
        con.query(`SELECT * FROM messages WHERE messageName = "reactrole"`, (err, rows) => {

            if (err) {
                console.log('  Error: A MySQL query error occured while fetching data from "messages" table');
                console.log('  -> File: reactrole-add.js')
                console.log(`    MySQL Error: ${err}`);
                await interaction.editReply({content: "Error: An error occured querying the database. Is it down?"});
                return;
            }

            // If there's no reactrole message there's no need to continue
            if (rows.length == 0) {
                await interaction.editReply({content: "Error: No reactrole message exists, use /rr-create first!"});
                return;
            }

            // Fetching all options since I need to use roleId in hte query and I want them all in the same place
            let role = interaction.options.getRole('role');


            con.query(`SELECT * FROM reactroles WHERE roleId = ${role.id}`)
                // Used to resolve message
                let channel = rows[0].channelId;
                let message = rows[0].messageId;

                interaction.guild.channels.fetch(channel).then(c => {
                        if (c.type != "GUILD_TEXT") {
                            // How would this even happen?
                            console.log('  Error: Reactrole channel was not a text channel');
                            await interaction.editReply({content: 'Error: The database had bad data... Idk how that happened o-o'});
                            return;
                        } 
                        c.messages.fetch(message).then(m => {
                            // Do work on the message here
                            let embed = m.embeds[0];
                            embed.addField()
                        }).catch(err => {
                            // Error fetching message
                            console.log(`  Error: Fetching reactrole message failed`);
                            console.log(`  -> File: reactrole-add.js`);
                            console.log(`    Error message: ${err}`);
                            await interaction.editReply({content: 'Error: The database had bad data... Idk how that happened o-o'});
                            return;
                        });
                    }).catch(err => {
                        // Error fetching channel
                        console.log(`  Error: Fetching reactrole channel failed`);
                        console.log(`  -> File: reactrole-add.js`);
                        console.log(`    Error message: ${err}`);
                        await interaction.editReply({content: 'Error: The database had bad data... Idk how that happened o-o'});
                        return;
                    });

        });
        /*
          For fetching options:

          interaction.options.getString('stringOptionName')
        */

    },
    permissions: 'all'
};