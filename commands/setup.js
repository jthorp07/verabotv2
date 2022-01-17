const {SlashCommandBuilder} = require('@discordjs/builders');
const {CommandInteraction} = require('discord.js');
const {Connection} = require('mysql');

const DATABASE_TABLES = [
    'CREATE TABLE IF NOT EXISTS channels(name VARCHAR(30) NOT NULL, channelId VARCHAR(30) NOT NULL);',
    'CREATE TABLE IF NOT EXISTS permissions(discordid VARCHAR(30) NOT NULL, isMod BOOL NOT NULL, isAdmin BOOL NOT NULL, isOwner BOOL NOT NULL);',
    'CREATE TABLE IF NOT EXISTS xp(id VARCHAR(30) NOT NULL, xp INTEGER NOT NULL, needed INTEGER NOT NULL, level INTEGER NOT NULL);',    
    'CREATE TABLE IF NOT EXISTS messages(messageName VARCHAR(30) NOT NULL, messageId VARCHAR(30) NOT NULL, channelId VARCHAR(30) NOT NULL);',
    'CREATE TABLE IF NOT EXISTS reactroles(roleId VARCHAR(30) NOT NULL, emoji VARCHAR(70) NOT NULL);'
];

const CHANNEL_NAMES = {REPORTS:"reports", LEVELUP:"levelup"};

module.exports = {
    data: new SlashCommandBuilder()
            .setName('setup')
            .setDescription('Sets up the discord bot because I dont wanna do it again')
            .addStringOption(option => 
              option.setName(CHANNEL_NAMES.REPORTS)
              .setDescription('ID of the channel to be designated for reports')
              .setRequired(true)
            )
            .addStringOption(option => 
                option.setName(CHANNEL_NAMES.LEVELUP)
                .setDescription('ID of the channel to be designated for "level up" messages')
                .setRequired(true)
            ),
            

    /**
     * 
     * @param {CommandInteraction} interaction 
     * @param {Connection} con 
     */
    async execute(interaction, con) {
        // TODO: Implement command code
        let reportsId = interaction.options.getString(CHANNEL_NAMES.REPORTS);
        let levelupId = interaction.options.getString(CHANNEL_NAMES.LEVELUP);

        // Creating all database tables
        for (const QUERY of DATABASE_TABLES) {
            con.query(QUERY, (err, rows) => {
                // After making channels table, get provided ID's and insert channels
                if (QUERY.includes("channels(")) {
                    con.query(`INSERT INTO channels(name, channelId) VALUES '${CHANNEL_NAMES.REPORTS}', '${reportsId}'`, (err, rows) => {
                        if (err) {
                            console.log('  Error setting up reports channel in db');
                        }
                    });
                    con.query(`INSERT INTO channels(name, channelId) VALUES '${CHANNEL_NAMES.LEVELUP}', '${levelupId}'`, (err, rows) => {
                        if (err) {
                            console.log('  Error setting up level up channel in db');
                        }
                    });
                }
            });
        }

    },
    permissions: 'owner'
};