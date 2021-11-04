const Discord = require('discord.js');
const mysql = require('mysql');

module.exports = class UserReact {

    /**
     * Attempts to add or remove a role from a user after
     * adding or removing a reaction from a ReactRole
     * message
     * 
     * @param {mysql.Connection} con
     * @param {Discord.MessageReaction} reaction
     * @param {Discord.User} user
     * @param {boolean} remove True if removing the role as opposed to adding
     * @param {Discord.Guild} guild
     */
    static modifyUserRoles(con, reaction, user, remove, guild) {

        let member = guild.members.resolve(user);
        let emojiIdentifier = reaction.emoji.identifier;

        console.log(emojiIdentifier);

        con.query(`SELECT * FROM reactroles WHERE emoji='<:${emojiIdentifier}>'`, (err, rows) => {

            if (err) {
                console.log(err);
                return;
            }

            if (rows.length == 0) {
                console.log('No reactrole pairs found');
                return;
            }

            let role = guild.roles.resolve(rows[0].role);
            if (remove) {
                console.log("Role removed");
                member.roles.remove(role);
            } else {
                console.log("Role added");
                member.roles.add(role);
            }  

        });

    }

}