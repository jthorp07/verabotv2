const {SlashCommandBuilder} = require('@discordjs/builders');
const {CommandInteraction, MessageEmbed} = require('discord.js');
const {Connection} = require('mysql');

module.exports = {
    data: new SlashCommandBuilder()
            .setName('rrCreate')
            .setDescription('Creates a reactrole message with the given emoji/role pairs.')
            .addRoleOption(option => {
                option.setName('role')
                .setDescription('The role that will be given upon reacting')
                .setRequired(true);
            })
            .addStringOption(option => {
                option.setName('emoji')
                .setDescription('The emoji that users will react to receive a role')
                .setRequired(true);
            }),
            
    /**
     * @param {CommandInteraction} interaction 
     * @param {Connection} con 
     */
    async execute(interaction, con) {

        // TODO: Implement command code
        // Permission is already checked at this point
        interaction.deferReply();

        /**
         * 1. Parse command arguments
         *                                         steps 1 and 2 might be already covered
         * 2. Fetch role & emoji resolvables
         * 
         * 3. Create & send message resolvable
         * 
         * 4. Add RR info to database for fetching in the future
         */
        let rrMessage = {embeds: [new MessageEmbed()
            .setGolor('GREEN')
            .setTitle('ReactRole Menu')
            .addField(`<@&${interaction.options.getRole('role').id}> ==> ${interaction.options.getString('emoji')}`)]};
        interaction.editReply(rrMessage);

        // TODO: Set up reactrole table and finish this
        con.query(``)

    },
    permission: 'moderator' // Added field to fetch permission level required
};