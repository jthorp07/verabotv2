const mysql = require('mysql');

module.exports = {

    /**
     * 
     * @param {mysql.Connection} con 
     * @param {string} permissionLevel 
     * @param {string} user 
     * 
     * @returns {Promise<boolean>}
     */
    async checkPermissions(con, permissionLevel, user) {

        return new Promise((resolve, reject) => {
            if (permissionLevel == 'all') {
                console.log(`Permissions: All -> Proceeding`);
                return;
            }
            let query = `SELECT * FROM permissions WHERE discordid = ${user}`
            con.query(query, (err, rows) => {
                if (err) {
                    console.log(`Error querying permissions`);
                    reject(err);
                }
                console.log(`Permissions: ${permissionLevel}`);
                console.log(`isOwner: ${rows[0].isOwner}`);
                // Owner
                if (permissionLevel == 'owner') {
                    if (rows[0].isOwner == 1) {
                        console.log(`Sufficient perms`);
                        resolve(true);
                    } else {
                        console.log(`Insufficient perms`);
                        resolve(false);
                    }
                }
                // Admin
                if (permissionLevel == 'administrator') {
                    if (rows[0].isAdmin == 1) {
                        console.log(`Sufficient perms`);
                        resolve(true);
                    } else {
                        console.log(`Insufficient perms`);
                        resolve(false);
                    }
                }
                // Mod
                if (permissionLevel == 'moderator') {
                    if (rows[0].isMod == 1) {
                        console.log(`Sufficient perms`);
                        resolve(true);
                    } else {
                        console.log(`Insufficient perms`);
                        resolve(false);
                    }
                }
                reject('the promise never resolved or rejected');            
            });
        });        
    }
}