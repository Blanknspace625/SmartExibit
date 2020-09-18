const mysql = require('mysql');

const pool = mysql.createConnection({
    host: 'epf.johnnybread.com', 
    user:'js_user', 
    password: 'smartexhibit',
    database: 'eportfolio'
});

static class Database{
    constructor()
    {

    }

    CreateNewUser()
    {
        
    }
}

module.exports = Database;