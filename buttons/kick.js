const { ButtonInteraction, MessageActionRow } = require('discord.js');


module.exports = {
    data: {
        buttonId: "kick", // customId of buttons that will execute this command
        permissions: "moderator" //TODO: Implement other permission options
    },
    /**
     * @param {ButtonInteraction} interaction 
     */
    async btnExecute(interaction) {

        //TODO: Implement permissions
        let contentSplit = interaction.message.content.split(" ");
        let target = "REPLACE_THIS";

        // Parse through array to find target
        for (let i = 0; i < contentSplit.length; i++) {
            if (contentSplit[i] == "(ID:") {
                // Grab user ID
                target = contentSplit[i + 1].substring(0,18);
            }
        }

        if (target == "REPLACE_THIS") {
            return; // failed to find target
        }

        // Kick
        interaction.guild.members.kick(target).then(user => {
            console.log(`Kicked user ${user.username} ID: ${user.id}`);
            interaction.reply({content:`Kicked user ${user.username} ID: ${user.id}`});
            //Fetch message & disable buttons
            let newComps = [];
            let newRows = [];
            interaction.message.components[0].components.forEach(component => {
                // Type isn't preserved but trust me, it's a MessageButton
                component.setDisabled(true);
                newComps.push(component);
            });

            newRows.push(new MessageActionRow().addComponents(newComps));
            let msg = interaction.message;
            msg = msg.edit({
                content: interaction.message.content,
                embeds: interaction.message.embeds,
                components: newRows
            });
        }).catch(err => {
            console.log(err);
        });
    },
}