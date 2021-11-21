const {MessageReaction, User} = require('discord.js');
const{Connection} = require('mysql');

module.exports = class UserReact {

    /**
     * Attempts to add or remove a role from a user after
     * adding or removing a reaction from a ReactRole
     * message
     * 
     * @param {Connection} con
     * @param {MessageReaction} reaction
     * @param {User} user
     * @param {boolean} remove True if removing the role as opposed to adding
     */
    static modifyUserRoles(con, reaction, user, remove) {

        let member = reaction.message.guild.members.resolve(user);
        let emojiIdentifier = reaction.emoji.identifier;
        let guild = reaction.message.guild;

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

            let role = guild.roles.resolve(rows[0].roleId);
            if (remove===true) {
                console.log("Role removed");
                member.roles.remove(role);
            } else {
                console.log("Role added");
                member.roles.add(role);
            }  

        });

    }

}