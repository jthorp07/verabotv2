const {SlashCommandBuilder} = require('@discordjs/builders');
const {CommandInteraction, MessageActionRow, MessageButton} = require('discord.js');
const {Connection} = require('mysql');

module.exports = {
    data: new SlashCommandBuilder()
            .setName('report')
            .setDescription('Generates a report about a message')
            .addStringOption(option =>
              option.setName('message-id')
              .setDescription('The ID of the message being reported')
              .setRequired(true))
            .addStringOption(option => 
              option.setName('reason')
              .setDescription('The reason you\'re reporting (if you would like to elaborate)')
              .setRequired(false)),

    /**
     * 
     * @param {CommandInteraction} interaction 
     * @param {Connection} con 
     */
    async execute(interaction, con) {

      // Don't really want there to be a public reply
      await interaction.deferReply();
      await interaction.deleteReply();
       
      // First, try to fetch the message
      let messageId = interaction.options.getString('message-id');
      // Also having the sender's DM channel ready makes it less messy later
      let dms = interaction.user.dmChannel;
      if (!dms) {
        dms = await interaction.user.createDM();
      }
      

      interaction.channel.messages.fetch(messageId)
        .then(message => {

          // If there's no message, let the user know you tried!
          if (!message) { 
            dms.send({content: `The ID you provided did not resolve to a message. Make sure you use the command in the same channel as the message you are reporting!`});
            console.log(`  Error: No message found\n  Halting command`);
            return;
          }

          // Get author & reporter information for report
          let authorName = message.author.tag;
          let authorId = message.author.id;
          let reporter = interaction.user.tag;
          let reporterId = interaction.user.id;
          let reportReason = interaction.options.getString('reason');

          if (!reportReason || reportReason == '') {
            reportReason = 'No reason given';
          }

          // Get report channel if set up
          con.query(`SELECT * FROM channels WHERE name="reports"`, (err, rows) => {
            if (err) {
              // Error fetching channel
              console.log(`  Error: Fetching report channel failed`);
              console.log(`  -> File: report.js`);
              console.log(`    Error message: ${err}`);
              dms.send({content: 'Error: Failed to retrieve report channel... Is the database down?'});
              return;
            }

            if (rows.length==0) {
              dms.send({content: 'Error: The server doesn\'t have a reports channel set up'});
              console.log(`  Error: No reports channel found\n  Halting command`);
              return;
            }

            interaction.guild.channels.fetch(rows[0].channelId).then(channel => {
              
              // Channel resolved here -> Make and send report
              if (channel.type != "GUILD_TEXT") {
                return;
              }

              // Make Ban, Warn, Close buttons
              let rows = [];
              rows.push(new MessageActionRow());
              let comps = [];
              comps.push(new MessageButton()
                        .setCustomId('ban')
                        .setLabel('Ban User')
                        .setStyle('DANGER'));
              comps.push(new MessageButton()
                        .setCustomId('warn')
                        .setLabel('Warn User')
                        .setStyle('SUCCESS'));
              comps.push(new MessageButton()
                        .setCustomId('close-report')
                        .setLabel('Close Report')
                        .setStyle('PRIMARY'));
              rows[0].addComponents(comps);

              let reportMsg = {
                content: `Report by ${reporter} (${reporterId})\n\`\`\`Report against:\n  ${authorName} (ID: ${authorId})\n\nReport reason:\n  ${reportReason}\`\`\``,
                components: rows
              }

              channel.send({content:message.content,
                            embeds:message.embeds,
                            components:message.components})
              .then(msg => {
                channel.send(reportMsg);
              });
              
              dms.send({content: "Report sent!"});
              
            });
          });

        })
        .catch(err => {

          dms.send({content: `The ID you provided did not resolve to a message. Make sure you use the command in the same channel as the message you are reporting!`});
          console.log(`  Error: No message found\n  Halting command`);
          console.log(`  EITHER NO MESSAGE OR UNCAUGHT ERROR\n${err}`);
          return;          
        });
    },
    permissions: 'all'
};