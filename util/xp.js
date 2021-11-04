/**
 * This module has the functions that query the bot's XP table and
 * run the bot's XP system.
 */

 const {Message} = require('discord.js');
 const {Connection} = require('mysql');

 module.exports = class XP {

    // Generates and returns a random number between 1-5
    static generateXP() {
        return Math.floor(Math.random() * (5 - 1) + 1);
    }

    /**
     * Increments a user's XP on sending a message.
     * If the user does not exist in the XP system,
     * adds the user to the system.
     * 
     * @param {Message} message
     * @param {Connection} con
     */
    static updateUserXP(message, con) {

        con.query(`SELECT * FROM xp WHERE id = '${message.author.id}'`, (err, rows) => {

            if (err) {
                throw err;
            }

            var query;

            if (rows.length == 0) {
                query = `INSERT INTO xp (id, xp, needed, level) VALUES ('${message.author.id}', '${XP.generateXP()}', '15', '0')`;
            } else {
                query = XP.addXPToUser(rows, message, con)
            }

            con.query(query, (err, rows) => {
                if (err) console.log(err);
            });

        })

    }

    /**
     * Adds experience to an existing user
     * 
     * @param rows
     * @param {Message} message
     * @param {Connection} con
     */
    static addXPToUser(rows, message, con) {

        let xp = rows[0].xp + XP.generateXP();
        let level = rows[0].level;
        let needed = rows[0].needed;
        if (xp >= needed) {
            console.log("LEVEL UP!");
            xp = xp - rows[0].needed;
            level = level + 1;
            needed = needed * 2;
            XP.levelUp(rows[0].id, level, message, con);
        }

        return `UPDATE xp SET xp=${xp}, needed=${needed}, level=${level} WHERE id=${rows[0].id}`;

    }

    /**
     * Broadcasts that a user has levelled up
     * 
     * @param id
     * @param level
     * @param {Message} message
     * @param {Connection} con
     */
    static levelUp(id, level, message, con) {

        console.log("LEVEL UP FUNCTION!");

        console.log(`${id}, ${level}, ${message.guild}`)

        con.query(`SELECT * FROM channels WHERE name='levelup'`, (err, rows) => {

            if (err) {
                console.log(`  Error: A MySQL error occured\n  ${err}`);
                return;
            } else if (rows.length == 0) {
                console.log('no levelup channel');
                return;
            } else {
                console.log(`${JSON.stringify(rows)}`);
                console.log(`Resolving channel ${rows[0].channelId}`);
                message.guild.channels.fetch(rows[0].channelId).then(channel => {
                    if (channel.type != "GUILD_TEXT") return;
                    channel.send({content: `Congrats <@${id}>,\nyou just reached level ${level}!\n\nStay epic, gamer :sunglasses:`});
                });
                
            }
        });
    }
 }