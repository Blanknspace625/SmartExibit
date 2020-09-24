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
    console.log("MariaDB Connected!");
});

exports.login = async function(req, res) {
    const email = req.body.email;
    const pwd = req.body.password;

    var sql = "SELECT * FROM User WHERE email = ?";
    conn.query(sql, [email], async function (err, results) {
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
