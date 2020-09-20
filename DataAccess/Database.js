var mysql = require('mysql');

const conn = mysql.createConnection({
    host: 'epf.johnnybread.com',
    user:'js_user',
    password: 'smartexhibit',
    database: 'eportfolio'
});

conn.connect(function(err) {
    if (err) throw err;
    console.log("MariaDB Connected!");
});

class database {
    CreateNewUser(User) {
        const firstName = User.GetUserFirstName();
        const lastName = User.GetUserLastName();
        const email = User.GetUserEmail();
        const profileImg = User.GetUserProfilePic();
        const pwd = User.GetUserPassword();

        var sql = "INSERT INTO User (firstName, lastName, email, profileImg, pwd, extLink) VALUES ('"+firstName+"'," +
            "'"+lastName+"', '"+email+"', '"+profileImg+"', '"+pwd+"', '000')";
        conn.query(sql, function (err, res) {
            if (err) throw err;
            console.log("1 record inserted");
        });
    }

    // Pending encryption
    VerifyUser(email, pwd) {
        var sql = "SELECT pwd FROM Users WHERE email = ?";
        conn.query(sql, [email], function (err, res) {
            if (err) throw err;

            if (res == pwd) {
                console.log("OK")
            } else {
                console.log("Wrong password!");
            }
        });
    }
}

module.exports = database;