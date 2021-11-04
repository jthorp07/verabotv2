const {SlashCommandBuilder} = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
            .setName('testbtncmd'/* ex: 'ping' for /ping */)
            .setDescription('a generic command that makes a button'/* description*/),
    async execute(interaction) {
        // TODO: Implement command code
        console.log(`  Test Buttons -> started`);
        // Somewhere within that:
        let rows = []; // will hold MessageActionRows -> idk but it doesnt work if you dont make the array then pass it in
        rows.push(new MessageActionRow());
        let comps = []; // will hold action row's components
        comps.push(new MessageButton()
                        .setCustomId('generic-id-1'/* ID string up to 100 characters */)
                        .setLabel('Generic Button'/* Text that displays on the button */)
                        .setStyle('PRIMARY'/* Flag to style the button... PRIMARY makes a regular Discord blue button */));
        rows[0].addComponents(comps);
        await interaction.reply({content:"This message has a button",components:rows});
    },
    permissions: 'owner'
};