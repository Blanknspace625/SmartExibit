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

exports.login = async function(req, res) {
    var email = req.body.email;
    var pwd = req.body.password;

    var sql = "SELECT * FROM User WHERE email = ?";
    conn.query(sql, [email], async function (err, results) {
        if (err) throw err;

        if (results.length > 0) {
            //const isVerified = await bcrypt.compare(pwd, res[0].pwd);
            if (pwd.valueOf() == results[0].pwd.valueOf()) {
                req.session.userName = req.body.email;
                res.redirect('/homepage');
            } else {
                res.status(206).send('Email or password is incorrect!');
            }
        } else {
            res.status(206).send('User does not exist!');
        }
    });
}

exports.register = async function(req, res) {
    const email = req.body.email;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const profilePictureRef = req.body.profilePictureRef;
    //const socialAccounts;
    const password = req.body.password;

    var sql = "INSERT INTO User (firstName, lastName, email, profileImg, pwd, extLink) VALUES ('"+firstName+"'," +
        "'"+lastName+"', '"+email+"', '"+profileImg+"', '"+pwd+"', 'https://www.facebook.com')";
    conn.query(sql, function (err, results) {
        if (err) throw err;
        res.status(200).send('Registeration success.');
        res.redirect('/signin');
    });
}

exports.newShowcase = async function(req, res){
    //TODO get userID from Session
    const UserID = req.body.UserID;
    const ShowcaseName = req.body.ShowcaseName;
    const currentDate = new Date();
    const privacyParam = req.body.privacyParam

    var sql = "INSERT INTO Showcase (idUser, showcaseName, dateCreated, privacyParam) VALUES('"+UserID+"','"+ShowcaseName+"', CURDATE(),'"+privacyParam+"')"

    conn.query(sql, function (err, results) {
        if (err) throw err;
        res.status(200).send('Showcase created successfully!');
        res.redirect('/dashboard');
    });
}
/*
class database {
    CreateNewUser(User) {
        const firstName = User.GetUserFirstName();
        const lastName = User.GetUserLastName();
        const email = User.GetUserEmail();
        const profileImg = User.GetUserProfilePic();
        const pwd = User.GetUserPassword();

        var sql = "INSERT INTO User (firstName, lastName, email, profileImg, pwd, extLink) VALUES ('"+firstName+"'," +
            "'"+lastName+"', '"+email+"', '"+profileImg+"', '"+pwd+"', 'https://www.facebook.com')";
        conn.query(sql, function (err, res) {
            if (err) throw err;
            console.log("1 record inserted");
        });
    }

    LoadUser(User) {
        const tmpEmail = User.GetUserEmail();

        var sql = "SELECT firstName, lastName, profileImg FROM Users WHERE email = ?";
        conn.query(sql, [tmpEmail], function(err, res) {
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
        conn.query(sql, [tmpEmail], function(err, res) {
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
}
*/
//module.exports = database;