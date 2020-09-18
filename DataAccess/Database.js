const mysql = require('mysql');

const conn = mysql.createConnection({
    host: 'epf.johnnybread.com',
    user:'js_user',
    password: 'smartexhibit',
    database: 'eportfolio'
});

conn.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

class Database {
    constructor()
    {

    }

    CreateNewUser(User)
    {
        const firstName = User.GetUserFirstName();
        const lastName = User.GetUserLastName();
        const email = User.GetUserEmail();
        const profileImg = User.GetUserProfilePic();
        const pwd = User.GetUserPassword();

        var rec = "INSERT INTO User (firstName, lastName, email, profileImg, pwd) VALUES ('+firstName+'," +
            "'+lastName+', '+email+', '+profileImg+', '+pwd+')";
        conn.query(rec, function (err, res) {
            if (err) throw err;
            console.log("1 record inserted");
        });
    }
}

module.exports = Database;