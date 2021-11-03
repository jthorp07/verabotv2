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

        // This might take longer than 3 seconds
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

        // Fetching options from command
        let role = interaction.options.getRole('role');
        let emoji = interaction.options.getString('emoji');
        let title = interaction.options.getString('ping-for');

        // Object literal for the message to be sent
        let rrMessage = {embeds: [new MessageEmbed()
            .setColor('GREEN')
            .setTitle('ReactRole Menu')
            .addField(`${title}`,`@${role.name} ==> ${emoji}`)]};
        
        await interaction.editReply(rrMessage).then(reply => {

            // Inserting reactrole information into the database
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

            // Adds a reaction to the message for others to add to
            reply.react(emoji);

        });
    },
    permissions: 'moderator' // Added field to fetch permission level required
};