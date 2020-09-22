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

    LoadUser(User) {
        const tmpEmail = User.GetUserEmail();

        var sql = "SELECT firstName, lastName, profileImg FROM Users WHERE email = ?";
        conn.query(sql, [tmpEmail], function (err, res) {
            if (err) throw err;

            User.SetUserFirstName(res[0].firstName);
            User.SetUserLastName(res[0].lastName);
            User.SetUserProfilePic(res[0].profileImg);
        });
    }

    // Pending encryption
    VerifyUser(User) {
        const tmpEmail = User.GetUserEmail();
        const tmpPwd = User.GetUserPassword();
        var stat = true;

        var sql = "SELECT pwd FROM User WHERE email = ?";
        conn.query(sql, [tmpEmail], function (err, res) {
            if (err) throw err;

            if (res[0].pwd == tmpPwd) {
                console.log("Logged in.");
            } else {
                console.log("Wrong password!");
                stat = false; // >> not working <<
            }
        });

        return stat;
    }

    CreateNewMedia(Media) {
        const URL = Media.GetMediaURL();
        const showcaseID = "12345"; // What is the showcase id?
        const mediaID = Media.GetMediaID();

        var sql = "INSERT INTO Media (idMedia, idShowcase, content) VALUES ('"+URL+"'," + 
            "'"+showcaseID+"', '"+mediaID+"')";
        conn.query(sql, function (err, res) {
            if (err) throw err;
            console.log("1 record inserted");
        });
    }
}

module.exports = database;