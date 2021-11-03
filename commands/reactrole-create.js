const {SlashCommandBuilder} = require('@discordjs/builders');
const {CommandInteraction, MessageEmbed} = require('discord.js');
const {Connection} = require('mysql');

module.exports = {
    data: new SlashCommandBuilder()
            .setName('rr-create')
            .setDescription('Creates a reactrole message with the given emoji/role pairs.')
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
     * @param {CommandInteraction} interaction 
     * @param {Connection} con 
     */
    async execute(interaction, con) {

        // TODO: Implement command code
        // Permission is already checked at this point
        await interaction.deferReply();

        // Check if message already exists
        con.query(`SELECT * FROM messages WHERE messageName = "reactrole"`, (err, rows) => {
            if (err) {
                console.log('  Error: A MySQL query error occured while fetching data from "messages" table');
                console.log(`    MySQL Error: ${err}`);
                interaction.editReply({content: "Error: An error occured querying the database. Is it down?"});
                return
            }

            if (rows.length == 1) {
                interaction.editReply(`A reactrole message already exists.\nUse /addreactrole to add to the existing reactrole message.`);
                return;
            }
        });

        /**
         * 1. Parse command arguments
         *                                         steps 1 and 2 might be already covered
         * 2. Fetch role & emoji resolvables
         * 
         * 3. Create & send message resolvable
         * 
         * 4. Add RR info to database for fetching in the future
         */
        let role = interaction.options.getRole('role');
        let emoji = interaction.options.getString('emoji');
        let title = interaction.options.getString('ping-for');

        let rrMessage = {embeds: [new MessageEmbed()
            .setColor('GREEN')
            .setTitle('ReactRole Menu')
            .addField(`${title}`,`@${role.name} ==> ${emoji}`)]};
        await interaction.editReply(rrMessage).then(reply => {
            con.query(`INSERT INTO messages(messageName, messageId, channelId) VALUES("reactrole", ${reply.id}, ${reply.channelId})`, (err, rows) => {
                if (err) {
                    console.log('  Error: A MySQL query error occured while inserting data into "messages" table');
                    console.log('  -> File: reactrole_create.js');
                    console.log(`    MySQL Error: ${err}`);
                    interaction.editReply({content: "Error: An error occured querying the database. Is it down?"});
                    return; 
                }
                console.log(`  Message information stored`);
            });

            con.query(`INSERT INTO reactroles (roleId, emoji) VALUES ('${role.id}', '${emoji}')`, (err, rows) => {
                if (err) {
                    console.log('  Error: A MySQL query error occured while inserting data into "reactroles" table');
                    console.log('  -> File: reactrole_create.js');
                    console.log(`    MySQL Error: ${err}`);
                    interaction.editReply({content: "Error: An error occured querying the database. Is it down?"});
                    return;
                }
                console.log(`  Role and emoji information stored`);
            });

            reply.react(emoji);

        });
    },
    permissions: 'moderator' // Added field to fetch permission level required
};