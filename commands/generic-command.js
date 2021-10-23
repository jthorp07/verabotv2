const {SlashCommandBuilder} = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
            .setName(''/* ex: 'ping' for /ping */)
            .setDescription(''/* description to be displayed in autofill */),
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