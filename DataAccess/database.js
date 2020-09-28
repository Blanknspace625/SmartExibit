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
                req.session.userInfo = ({
                    firstName: results[0].firstName,
                    lastName: results[0].lastName,
                    email: results[0].email,
                    socialAccounts: results[0].socialAccounts,
                    profileImg: results[0].profileImg,
                    extLink: results[0].extLink
                });

                res.redirect('/dashboard');
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
            res.status(200).send('User ' + userID + ' detail(s) updated');
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
                        res.status(200).send('User ' + userID + ' password updated');
                    });
                } else {
                    res.status(206).send('New passwords don\'t agree!');
                }
            } else {
                res.status(206).send('Old password is incorrect!');
            }
        });
    } else {
        res.status(401).send('Unauthorised');
    }
}

exports.newShowcase = async function(req, res) {
    if (req.session.userId) {
        const userID = req.session.userId;
        const showcaseName = req.body.showcaseName;
        const privacyParam = req.body.privacyParam;
    
        var sql = "INSERT INTO Showcase (idUser, showcaseName, dateCreated, privacyParam) VALUES('"+userID+"'," +
            "'"+showcaseName+"', CURDATE(),'"+privacyParam+"')";
        conn.query(sql, function (err, results) {
            if (err) throw err;
            res.redirect('/dashboard/:' + req.session.userId);
        });
    } 
    else {
        res.status(206).send('Not Authorised to create a showcase');
    }
}

exports.updateShowcase = async function(req, res) {
    if (req.session.userId) //Check that user is logged in
    {
        const showcaseID = req.body.showcaseID;
        const showcaseName = req.body.showcaseName;
        const privacyParam = req.body.privacyParam;
        const ownerID = req.body.ownerID;

        if(ownerID == req.session.userID) //Check that logged in user owns the showcase being modified
        {
            var sql = "UPDATE Showcase SET showcaseName = '"+showcaseName+"', privacyParam = '"+privacyParam+"' WHERE idShowcase = '"+showcaseID+"'";
            conn.query(sql, function (err, results) 
            {
                if (err) throw err;
                res.status(200).send('Showcase ' + showcaseName + ' detail(s) updated');
            });
        }
    }
    else //User does not own the showcase
    {
        res.status(401).send('Unauthorised');
        return;
    }
}

exports.getShowcaseData = async function(req, res)
{
    const showcaseID = req.headers.showcaseid;

    conn.query("SELECT * FROM Showcase WHERE idShowcase = ?", showcaseID, async function (err, results) {
        if (err) throw err;
        if(results.length > 0) //case: showcase found
        {
            if(results[0].privacyParam == "Only Me" && results[0].idUser != req.session.userID) //case: User not authorised 
            {
                res.status(401).send("Not Authorised to access this content!");
                return;
            }

            //Return Data as a json format
            res.json({
                idShowcase : results[0].showcaseID,
                showcaseName : results[0].showcaseName,
                dateCreated : results[0].dateCreated,
                privacyParam : results[0].privacyParam,
                idUser : results[0].idUser
            });
        }
        else //case: showcase not found
        {
            res.status(404).send("User showcase not found!")
        }
    });
}

exports.newMedia = async function(req, res) {
    var URL = req.body.link;
    var showcaseID = req.body.showcaseid;

    var sql = "INSERT INTO Media (idShowcase, content) VALUES ('"+showcaseID+"','"+URL+"')";
    conn.query(sql, function (err, results) {
        if (err) throw err;
        console.log("1 record inserted");
    });
}

exports.retrieveMedia = async function(req, res) {
    var sql = "SELECT content FROM Media WHERE idMedia = ?";
    conn.query(sql, [mediaid], function (err, results) {
        if (err) throw err;
            res.redirect(results[0].content);
    });
}
