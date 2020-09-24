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
    var email = req.body.username;
    var pwd = req.body.password;

    var sql = "SELECT * FROM User WHERE email = ?";
    conn.query(sql, [email], async function (err, results) {
        if (err) throw err;

        if (results.length > 0) {
            //const isVerified = await bcrypt.compare(pwd, res[0].pwd);
            if (pwd.valueOf() == results[0].pwd.valueOf()) {
                req.session.userId = results[0].idUser;
                res.redirect('/dashboard/:' + req.session.userId);
            } else {
                res.status(206).send('Email or password is incorrect!');
            }
        } else {
            console.log("Login attempt: " + req.body.username + ", password provided: " + req.body.password);
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

exports.newShowcase = async function(req, res) {
    if (req.session.userId) {
        console.log(req.session.userId);
        
        var UserID = req.session.userId;
        const ShowcaseName = req.body.ShowcaseName;
        const privacyParam = req.body.privacyParam
    
        var sql = "INSERT INTO Showcase (idUser, showcaseName, dateCreated, privacyParam) VALUES('"+UserID+"'," +
            "'"+ShowcaseName+"', CURDATE(),'"+privacyParam+"')";
    
        conn.query(sql, function (err, results) {
            if (err) throw err;
            res.redirect('/dashboard/:' + req.session.userId);
        });
   } else {
       res.status(206).send('Not Authorised to create a showcase');
   }
}