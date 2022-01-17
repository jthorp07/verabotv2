const { ButtonInteraction, MessageActionRow } = require('discord.js');

module.exports = {
    data: {
        buttonId: "warn", // customId of buttons that will execute this command
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
                target = contentSplit[i + 1].substring(0,18);
            }
        }

        if (target == "REPLACE_THIS") {
            return; // failed to find target
        }

        // DM a warning
        interaction.guild.members.fetch(target).then(user => {
            user.createDM().then(channel => {
                channel.send({content:"Hey there, someone reported you and from that report a staff member has decided to give you a warning."});
            });
            interaction.reply({content:`User ${target} has been warned.`});
        });

        //Fetch message & disable buttons
        let newRows = [];
        let newComps = [];
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

    },
}