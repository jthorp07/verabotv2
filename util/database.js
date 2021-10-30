/**
 * This module allows the database to be freely queried in the server
 * 
 */

/**
 * TODO: Refactor to command with permission: owner
 */
const {Message} = require('discord.js');
const {Connection} = require('mysql');

module.exports = {

    /**
     * 
     * @param {Connection} con  
     * @param {Message} message 
     */
    async queryDB(con, message) {

        con.query(message.content, (err, rows) => {

            if (err) {
                message.channel.send("Error with mySQL query, check console");
                console.log(err);
                return;
            }

            try {
                if (rows.length == 0) {
                    message.channel.send("Nothing here :(");
                } else {
                    rows.forEach(row => {
                        message.channel.send(JSON.stringify(row))
                    });
                }                
            } catch (err) {
                message.channel.send(":thumbsup:")
                return;
            }            

        });

    }

}