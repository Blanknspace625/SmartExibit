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
    CreateNewUser(User)
    {
        const firstName = User.GetUserFirstName();
        const lastName = User.GetUserLastName();
        const email = User.GetUserEmail();
        const profileImg = User.GetUserProfilePic();
        const pwd = User.GetUserPassword();

<<<<<<< HEAD
        var rec = "INSERT INTO User (firstName, lastName, email, profileImg, pwd, extLink) VALUES ('+firstName+'," +
            "'+lastName+', '+email+', '+profileImg+', '+pwd+', '000')";
=======
        var rec = "INSERT INTO User (firstName, lastName, email, profileImg, pwd, extLink) VALUES ("+firstName+", " +
            ""+lastName+", "+email+", "+profileImg+", "+pwd+", '000')";
>>>>>>> b3dac5737b888874c5b594eceb8e8ce394483ba9
        conn.query(rec, function (err, res) {
            if (err) throw err;
            console.log("1 record inserted");
        });
    }
}

module.exports = Database;