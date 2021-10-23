const {SlashCommandBuilder} = require('@discordjs/builders');

// Command perms
const PERMISSIONS = 'moderator';

module.exports = {
    data: new SlashCommandBuilder()
            .setName('rrCreate'/* ex: 'ping' for /ping */)
            .setDescription('Creates a reactrole message with the given emoji/role pairs.'/* description to be displayed in autofill */),
    async execute(interaction) {

        // TODO: Implement user permissions {Fetch from database}
            /*
              To do this, will have a table named {UserPermissions} in db
              Structure:
                UserPermissions {
                    permissionName: roleId
                    permissionName: roleId
                    ...
                }
              Command will declare permission required, then query database &
              compare returned roleId to user's roles

              If permissions not met: bot replies "Insufficient permissions"
            */
         

        // TODO: Implement command code

    },

};