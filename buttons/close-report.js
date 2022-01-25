const {ButtonInteraction, MessageActionRow} = require('discord.js');


module.exports = {
    data: {
        buttonId: "close-report",
        permissions: "moderator" 
    },
    /**
     * @param {ButtonInteraction} interaction 
     */
    async btnExecute(interaction) {

        await interaction.deferReply();

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

        // Send message confirming closure, then delete 5 seconds later
        await interaction.editReply('Report closed!').then(message => {
            setTimeout(()=>{
                message.delete();
            }, 5000);
        })
    },
}