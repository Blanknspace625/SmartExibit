const mysql = require('mysql');

const pool = mysql.createConnection({
    host: 'epf.johnnybread.com', 
    user:'js_user', 
    password: 'smartexhibit',
    database: 'eportfolio'
});

class Database{
    constructor()
    {

    }

    static CreateNewUser(User)
    {
        
    }
}

module.exports = Database;