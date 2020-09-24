var mysql = require('mysql');
var bcrypt = require('bcrypt');

const conn = mysql.createConnection({
    host: 'epf.johnnybread.com',
    user:'js_user',
    password: 'smartexhibit',
    database: 'eportfolio'
});

conn.connect(function(err) {
    if (err) throw err;
    console.log("Database server connected!");
});

exports.login = async function(req, res) {
    const email = req.body.email;
    const pwd = req.body.password;

    conn.query("SELECT * FROM User WHERE email = ?", [email], async function (err, results) {
        if (err) throw err;

        if (results.length > 0) {
            const isVerified = await bcrypt.compare(pwd, results[0].pwd);
            if (isVerified) {
                req.session.userId = results[0].idUser;
                res.redirect('/dashboard/:' + req.session.userId);
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
    const profilePicRef = '/Public/Images/default_avatar.png';
    //const socialAccounts;
    const pwd = await bcrypt.hash(req.body.password, 8);

    var sql = "INSERT INTO User (firstName, lastName, email, profileImg, pwd, extLink) VALUES ('"+firstName+"'," +
        "'"+lastName+"', '"+email+"', '"+profilePicRef+"', '"+pwd+"', 'https://www.facebook.com')";
    conn.query(sql, function (err, results) {
        if (err) throw err;
        res.redirect('/signin');
    });
}

exports.changeRegularDetails = async function(req, res) {
    if (req.session.userId) {
        const userID = req.session.userId;
        const email = req.body.email;
        const firstName = req.body.firstName;
        const lastName = req.body.lastName;

        var sql = "UPDATE User SET firstName = '"+firstName+"', lastName = '"+lastName+"'," +
            "email = '"+email+"' WHERE idUser = '"+userID+"'";
        conn.query(sql, function (err, results) {
            if (err) throw err;
            res.status(200).send('User' + userID + 'detail(s) updated');
        });
    } else {
        res.status(401).send('Unauthorised');
    }
}

exports.changeSensitiveDetails = async function(req, res) {
    if (req.session.userId) {
        const userID = req.session.userId;
        const oldPwd = req.body.oldPassword;
        const newPwd = req.body.newPassword;
        const newPwdAgain = req.body.newPasswordAgain;

        conn.query("SELECT * FROM User WHERE idUser = ?", [userID], async function (err, results) {
            if (err) throw err;

            const isVerified = await bcrypt.compare(oldPwd, results[0].pwd);
            if (isVerified) {
                if (newPwd.valueOf() == newPwdAgain.valueOf()) {
                    const pwd = await bcrypt.hash(req.body.newPassword, 8);

                    var sql = "UPDATE User SET pwd = '"+pwd+"' WHERE idUser = '"+userID+"'";
                    conn.query(sql, function (err, results) {
                        if (err) throw err;
                        res.status(200).send('User' + userID + 'password updated');
                    });
                } else {
                    res.status(206).send('New passwords don\'t agree!');
                }
            } else {
                res.status(206).send('Old password is incorrect!');
            }
        });
    }
}

exports.newShowcase = async function(req, res) {
    if (req.session.userId) {
        console.log(req.session.userId);
        
        const userID = req.session.userId;
        const showcaseName = req.body.showcaseName;
        const privacyParam = req.body.privacyParam;
    
        var sql = "INSERT INTO Showcase (idUser, showcaseName, dateCreated, privacyParam) VALUES('"+userID+"'," +
            "'"+showcaseName+"', CURDATE(),'"+privacyParam+"')";
        conn.query(sql, function (err, results) {
            if (err) throw err;
            res.redirect('/dashboard/:' + req.session.userId);
        });
    } else {
        res.status(206).send('Not Authorised to create a showcase');
    }
}