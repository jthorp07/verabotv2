const {Client, Intents, Collection} = require('discord.js');
const {TOKEN, DB, DBPASS, GUILD_ID, CLIENT_ID, OWNER_ID} = require('./config.json');
const fs = require('fs');
const mysql = require('mysql');
const {XP, UserReact} = require('./util');

// Holy fuck that's a lot of intention :flushed:
const intent_flags = [Intents.FLAGS.GUILDS, 
    Intents.FLAGS.GUILD_BANS, 
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, 
    Intents.FLAGS.GUILD_MEMBERS, 
    Intents.FLAGS.GUILD_MESSAGES, 
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS, 
    Intents.FLAGS.GUILD_MESSAGE_TYPING, 
    Intents.FLAGS.GUILD_PRESENCES, 
    Intents.FLAGS.GUILD_VOICE_STATES, 
    Intents.FLAGS.GUILD_WEBHOOKS, 
    Intents.FLAGS.DIRECT_MESSAGES, 
    Intents.FLAGS.DIRECT_MESSAGE_REACTIONS, 
    Intents.FLAGS.DIRECT_MESSAGE_TYPING];

const client = new Client({intents: intent_flags});

/*
  Log in to database
*/
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: DBPASS,
    database: DB,
    insecureAuth: true
});

// Just read the library docs and apparently this is intended use
con.connect(err => {
    if (err) {
        console.log(`Error connecting to database`);
        return;
    }
    console.log(`Connected to database on thread ${con.threadId}`);
})

/**
 * Other variables for runtime
 */
var acceptReactionEvents = false;

/*
* Registering Commands
*/
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const Perms = require('./util/permission'); // For checking user permissions before executing commands

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

/*
  Preparing button vars for potential button handling
*/
let btnCommandsTemp = new Collection();
const btnFiles = fs.readdirSync('./buttons').filter(file => file.endsWith('.js'));
for (const file of btnFiles) {
    const btnCmd = require(`./buttons/${file}`);
    btnCommandsTemp.set(btnCmd.data.buttonId, btnCmd);
}
const btnCommands = btnCommandsTemp;

/**
 * Bot startup -> Mostly fetching stuff that is most likely 
 * cached for runtime use
 */
client.on('ready', () => {

    con.query(`SELECT * FROM messages`, (err, rows) => {

        if (err) {
            console.log('  Error: A MySQL query error occured while fetching data from "messages" table');
            console.log(`    MySQL Error: ${err}`);
            console.log('  WARNING: Bot functions requiring potentially cached messages may not function properly');
            return;
        }

        rows.forEach(row => {
            let channel = row.channelId;
            let message = row.messageId;
            client.guilds.fetch(GUILD_ID)
                .then(g => g.channels.fetch(channel)
                .then(c => {
                    if (c.type != "GUILD_TEXT") return;
                    c.messages.fetch(message).catch(err => {
                        console.log(`  Error fetching message: ${err}`);
                    });

                    // So the bot knows to quickly return from reaction events
                    if (row.messageName == 'reactrole') {
                        acceptReactionEvents = true;
                    }
                })).catch(err => {
                    console.log(`  Something went wrong fetching message ${row.messageName}`);
                    console.log('  WARNING: Bot functions requiring potentially cached messages may not function properly');
                });
        });

    });
    console.log('Bot Ready!');

});

// Command Handling
client.on('interactionCreate', async interaction => {

    // This handler only deals with command interactions
    if (!interaction.isCommand()) return;

    // Check command exists
    const command = client.commands.get(interaction.commandName);
	if (!command) return;

    console.log(`Command received: ${command.data.name}`);

    // Check user permissions
    Perms.checkPermissions(con, command.permissions, interaction.member.id).then(perms => {
        if (!perms) {
            interaction.reply(`  Insufficient user permissions:\n\`\`\`Permission \'${command.permissions}\' required\`\`\``);
            return;
        }
        try {
		    command.execute(interaction, con);
            console.log(`  Command executed`);
	    } catch (error) {
		    console.log(`  An uncaught error occured in command execution`);
            console.log(`    Error: ${error}`);
		    interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	    }
    }).catch(err => {
        console.log(err);
        return;
    });	
});


/*
  Button Handler
*/
client.on('interactionCreate', (interaction) => {
    if (!interaction.isButton()) return

    // Handle buttons here...
    
    const btnCommand = btnCommands.get(interaction.customId);
    console.log(`Button pressed with id '${interaction.customId}'`);
    if (!btnCommand) {
        interaction.reply(`This button doesn't have a registered command.\n
                                Please send a report to a bot developer to have this fixed.`);
        return;
    }

    // Check user permissions
    if (!Perms.checkPermissions(con, btnCommand.data.permissions, interaction.member.id)) {
        interaction.reply(`Insufficient user permissions:\nPermission \'${btnCommand.data.permissions}\'`);
        console.log(`  Insufficient permissions: Halting button handler`);
    }

    try {
        btnCommand.btnExecute(interaction);
        console.log(`  Button handled`);
    } catch (err) {
        console.error(err);
        interaction.reply({ content: 'There was an error while executing this button\'s command!', ephemeral: true});
        return;
    }

    

});

/**
 * TODO: XP system has to use the messageCreate event
 */
client.on('messageCreate', recvdMsg => {

    console.log('Returning from messageCreate to prevent XP spam');
    return;

    let msgType = recvdMsg.type;
    if (msgType == "APPLICATION_COMMAND" || recvdMsg.author.id == CLIENT_ID || recvdMsg.content.startsWith('/')) {
        return;
    }
    XP.updateUserXP(recvdMsg, con);
    console.log(`${msgType} message received`);    
});

/**
 * Reactions
 */
client.on('messageReactionAdd', (reaction, user) => {

    if (!acceptReactionEvents == true) return;

    if (user.id != CLIENT_ID && user.id != OWNER_ID) {
        console.log("Reaction removed");

        con.query(`SELECT * FROM messages WHERE messageName='reactrole'`, (err, rows) => {

            if(err) console.log(err);
            if (rows.length > 0) {

                if (reaction.message.id == rows[0].messageId) {
                    console.log("Reaction removed from RR message");
                    UserReact.modifyUserRoles(con, reaction, user, false);
                }
            }
        });
    }

});

client.on('messageReactionRemove', (reaction, user) => {

    if (!acceptReactionEvents==true) return;

    if (user.id != CLIENT_ID && user.id != OWNER_ID) {
        console.log("Reaction removed");

        con.query(`SELECT * FROM messages WHERE messageName='reactrole'`, (err, rows) => {

            if(err) {
                console.log(err);
                return;
            }
            if (rows.length > 0) {

                if (reaction.message.id == rows[0].messageId) {
                    console.log("Reaction removed from RR message");
                    UserReact.modifyUserRoles(con, reaction, user, true);
                }
            }
        });
    }
    
});

client.login(TOKEN);