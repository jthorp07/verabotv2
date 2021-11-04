const {SlashCommandBuilder} = require('@discordjs/builders');
const {CommandInteraction} = require('discord.js');
const {Connection} = require('mysql');

const DATABASE_TABLES = [
    'CREATE TABLE IF NOT EXISTS permissions(discordid VARCHAR(30) NOT NULL, isMod BOOL NOT NULL, isAdmin BOOL NOT NULL, isOwner BOOL NOT NULL);',
    'CREATE TABLE IF NOT EXISTS xp(id VARCHAR(30) NOT NULL, xp INTEGER NOT NULL, needed INTEGER NOT NULL, level INTEGER NOT NULL);',
    'CREATE TABLE IF NOT EXISTS channels(name VARCHAR(30) NOT NULL, channelId VARCHAR(30) NOT NULL);',
    'CREATE TABLE IF NOT EXISTS messages(messageName VARCHAR(30) NOT NULL, messageId VARCHAR(30) NOT NULL, channelId VARCHAR(30) NOT NULL);',
    'CREATE TABLE IF NOT EXISTS reactroles(roleId VARCHAR(30) NOT NULL, emoji VARCHAR(70) NOT NULL);'
];

const CHANNEL_NAMES = ['reports', 'levelup'];

module.exports = {
    data: new SlashCommandBuilder()
            .setName('setup')
            .setDescription('Sets up the discord bot because I dont wanna do it again'),
            /*
              For other options:

              .addStringOption(option => 
                option.setName('optionName')
                .setDescription('desc')
                .setRequired(true or false)
              )
            */

    /**
     * 
     * @param {CommandInteraction} interaction 
     * @param {Connection} con 
     */
    async execute(interaction, con) {
        // TODO: Implement command code

    },
    permissions: 'owner'
};