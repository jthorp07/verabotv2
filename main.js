const {Client, Intents, Collection} = require('discord.js');
const {TOKEN, DB, DBPASS} = require('./config.json');
const fs = require('fs');
const mysql = require('mysql');

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

console.log(`Client Instantiated`);
const client = new Client({intents: intent_flags});

/*
  Log in to database
*/
console.log(`Connecting to MySQL Database`);
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: DBPASS,
    database: DB,
    insecureAuth: true
});
console.log(`MySQL Connection Created`);


/*
* Registering Commands
*/
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const Perms = require('./util/permission'); // For checking user permissions before executing commands

console.log(`Setting Commands`);
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
    console.log(`  Fetching command '${command.data.name}''`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
    console.log(`  Command '${command.data.name} set'`);
}

/*
  Preparing button vars for potential button handling
*/
console.log(`Setting button commands`);
let btnCommandsTemp = new Collection();
const btnFiles = fs.readdirSync('./buttons').filter(file => file.endsWith('.js'));
for (const file of btnFiles) {
    const btnCmd = require(`./buttons/${file}`);
    btnCommandsTemp.set(btnCmd.data.customId, btnCmd);
}
const btnCommands = btnCommandsTemp;
console.log(`  Button commands set`);


/**
 * Bot's listeners
 */
client.on('ready', () => {

    console.log('Bot Ready.');

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
            console.log(`  Insufficient permissions: Halting command`);
            interaction.reply(`  Insufficient user permissions:\nPermission \'${command.permissions}\' required`);
            return;
        }
        try {
		    command.execute(interaction, con);
            console.log(`  Command executed`);
	    } catch (error) {
		    console.error(error);
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
    console.log(`Button pressed`)
    const btnCommand = btnCommands.get(interaction.customId);
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

    //TODO: Add XP system

    //TODO: Add Database channel support
    

});

client.login(TOKEN);