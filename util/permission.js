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
                resolve(true);
            }
            let query = `SELECT * FROM permissions WHERE discordid = ${user}`
            con.query(query, (err, rows) => {
                if (err) {
                    console.log(`Error querying permissions`);
                    reject(err);
                }
                // Owner
                if (permissionLevel == 'owner') {
                    if (rows[0].isOwner == 1) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                }
                // Admin
                if (permissionLevel == 'administrator') {
                    if (rows[0].isAdmin == 1) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                }
                // Mod
                if (permissionLevel == 'moderator') {
                    if (rows[0].isMod == 1) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                }
                reject(new Error('the promise never resolved or rejected'));            
            });
        });        
    }
}