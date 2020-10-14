var db = require('./db_interface');
var bcrypt = require('bcrypt');
var nodemailer = require('nodemailer');
var crypto = require('crypto');
const { validRange } = require('semver');

exports.login = async function(req, res) {
    const email = req.body.email;
    const pwd = req.body.password;

    db.getConnection(function(err, conn) {
        conn.query("SELECT * FROM User WHERE email = ?", [email], async function (err, results) {
            if (err) throw err;

            if (results.length > 0) {
                const isVerified = await bcrypt.compare(pwd, results[0].pwd);

                if (isVerified) {
                    if(results[0].status == 'verified') {
                        req.session.userId = results[0].idUser;
                        req.session.userInfo = ({
                            firstName: results[0].firstName,
                            lastName: results[0].lastName,
                            email: results[0].email,
                            socialAccounts: results[0].socialAccounts,
                            profileImg: results[0].profileImg,
                            extLink: results[0].extLink
                        });
    
                        conn.release();
                        res.redirect('/dashboard');
                    } else {
                        res.status(206).send('Your account must be verified before you can login');
                    }
                    
                } else {
                    res.status(206).send('Email or password is incorrect!');
                }
            } else {
                res.status(206).send('User does not exist!');
            }
        });
    });
}

exports.register = async function(req, res) {
    const email = req.body.email;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const profilePicRef = '/Public/Images/default_avatar.png';
    //const socialAccounts;
    const pwd = await bcrypt.hash(req.body.password, 8);

    db.getConnection(function(err, conn) {
        var sql = "INSERT INTO User (firstName, lastName, email, profileImg, pwd, extLink) VALUES ('" + firstName + "'," +
            "'" + lastName + "', '" + email + "', '" + profilePicRef + "', '" + pwd + "', 'https://www.facebook.com')";
        conn.query(sql, function (err, results) {
            if (err) throw err;

            exports.verifyEmail(req,res);
            conn.release();
            res.redirect('/signin');
        });
    });


}

exports.verifyEmail = async function(req, res) {
    const email = req.body.email;

    //Generate a random string for email
    const code = crypto.randomBytes(128).toString('hex').slice(0,128);

    db.getConnection(function(err, conn) {
        // Get user id from db
        conn.query("SELECT * FROM User WHERE email = ?", [email], async function (err, results) {
            if (err) throw err;

            var userId = results[0].idUser;
            const current = new Date(new Date().toUTCString());

            // Insert user id and verify code into db
            var sql = "INSERT INTO Code (userId, code) VALUES ('" + userId + "','" + code + "') ON DUPLICATE KEY UPDATE code = '" + code + "', createDate = UTC_TIMESTAMP()";
            conn.query(sql, [email], async function (err, results) {
                if (err) throw err;
                
                // Send verify link to email
                const url = 'localhost/verify-email/' + userId + '/' + code;

                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'smartexibit@gmail.com',
                        pass: 'rXg8d$61n7%z'
                    }
                });
            
                var mailOptions = {
                    from: 'smartexibit@gmail.com',
                    to: email,
                    subject: 'Verify Your Email',
                    text: 'You are receiving this email if you need to verify your email for your Smart Exhibit account. Please click the link below:\n\n' + 
                        url +
                        '\n\nThis link expires in 10 minutes from the time you recieved this email.'
                };
            
                transporter.sendMail(mailOptions, function(error, info) {
                    if(error) 
                    {
                        console.log(error);
                    }
                    else
                    {
                        console.log('Email sent: ' + info.response);
                    }
                });

                conn.release();
            });
        });
    });
}

exports.verifyEmailResponse = async function(req, res)
{
    const userID = req.params.userid;
    const code = req.params.code;

    db.getConnection(function(err, conn) {
        conn.query("SELECT * FROM User WHERE idUser = ?", [userID], async function (err, results) {
            if (err) throw err;

            if(results.length > 0) {
                // Check if user is not verified
                const status = results[0].status;
                if(status == 'pending') {
                    // Check if user has matching code
                    conn.query("SELECT * FROM Code WHERE userid = ?", [userID], async function (err, results) {
                        if (err) throw err;
                        
                        const dbCode = results[0].code;
                        const create = results[0].createDate;
                        const current = new Date(new Date().toUTCString());
                        const diff = current.getTime() - create.getTime();

                        if(code == dbCode) {
                            // Link expires after 10 minutes
                            if(diff/60000 < 10) {
                                // Change status to verified
                                var sql = "UPDATE User SET status = 'verified' WHERE idUser = '" + userID + "'";
                                conn.query(sql, function (err, results) {
                                    if (err) throw err;
                                });

                                // Delete code entry from db as no longer needed
                                var sql = "DELETE FROM Code WHERE userid = '" + userID + "'";
                                conn.query(sql, function (err, results) {
                                    if (err) throw err;

                                    conn.release();
                                    res.redirect('/signin');
                                });
                            }
                            else {
                                // Delete code entry from db as no longer needed
                                var sql = "DELETE FROM Code WHERE userid = '" + userID + "'";
                                conn.query(sql, function (err, results) {
                                    if (err) throw err;

                                    conn.release();
                                });
                                res.status(206).send('Verification link expired');
                            }
                        }
                        else {
                            res.redirect('/verify');
                        }
                    });
                }
                else {
                    res.status(206).send('User email already verified');
                }
            } else {
                res.status(206).send('Verification link does no exist');
            }
        });
    });
}

exports.changeRegularDetails = async function(req, res) {
    if (req.session.userId) {
        const userID = req.session.userId;
        const email = req.body.email;
        const firstName = req.body.firstName;
        const lastName = req.body.lastName;

        db.getConnection(function(err, conn) {
            var sql = "UPDATE User SET firstName = '" + firstName + "', lastName = '" + lastName + "'," +
                "email = '" + email + "' WHERE idUser = '" + userID + "'";
            conn.query(sql, function (err, results) {
                if (err) throw err;

                conn.release();
                res.status(200).send('User ' + userID + ' detail(s) updated');
            });
        });
    } else {
        res.status(401).send('Unauthorised');
    }
}

exports.forgotPassword = async function (req, res) {
    const email = req.body.email;

    //Generate a random string for email
    const code = crypto.randomBytes(128).toString('hex').slice(0,128);

    db.getConnection(function(err, conn) {
        // Get user id from db
        conn.query("SELECT * FROM User WHERE email = ?", [email], async function (err, results) {
            if (err) throw err;

            if(results.length > 0) {
                if(results[0].status == 'verified') {
                    var userId = results[0].idUser;

                    // Insert user id and reset code into db
                    var sql = "INSERT INTO ResetCode (userId, code) VALUES ('" + userId + "','" + code + "') ON DUPLICATE KEY UPDATE code = '" + code + "', createDate = UTC_TIMESTAMP()";
                    conn.query(sql, [email], async function (err, results) {
                        if (err) throw err;
                        
                        // Send reset link to email
                        const url = 'localhost/resetpassword/' + userId + '/' + code;
    
                        var transporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                                user: 'smartexibit@gmail.com',
                                pass: 'rXg8d$61n7%z'
                            }
                        });
                    
                        var mailOptions = {
                            from: 'smartexibit@gmail.com',
                            to: email,
                            subject: 'Reset Your Password',
                            text: 'You are receiving this email if you have forgotten your password to your Smart Exhibit account. Please click the link below to reset your password:\n\n' + 
                                url +
                                '\n\nThis link expires in 10 minutes from the time you recieved this email.'
                        };
                    
                        transporter.sendMail(mailOptions, function(error, info) {
                            if(error) 
                            {
                                console.log(error);
                            }
                            else
                            {
                                console.log('Email sent: ' + info.response);
                            }
                        });
    
                        conn.release();
                    });
                }
            }
            // Regardless of whether an email is sent or not, display message
            res.status(200).send('Reset password link sent to email.');
        });
    });
}

exports.changeSensitiveDetails = async function(req, res) {
    if (req.session.userId) {
        const userID = req.session.userId;
        const oldPwd = req.body.oldPassword;
        const newPwd = req.body.newPassword;
        const newPwdAgain = req.body.newPasswordAgain;

        db.getConnection(function(err, conn) {
            conn.query("SELECT * FROM User WHERE idUser = ?", [userID], async function (err, results) {
                if (err) throw err;

                const isVerified = await bcrypt.compare(oldPwd, results[0].pwd);
                if (isVerified) {
                    if (newPwd.valueOf() == newPwdAgain.valueOf()) {
                        const pwd = await bcrypt.hash(req.body.newPassword, 8);

                        var sql = "UPDATE User SET pwd = '" + pwd + "' WHERE idUser = '" + userID + "'";
                        conn.query(sql, function (err, results) {
                            if (err) throw err;

                            conn.release();
                            res.status(200).send('User ' + userID + ' password updated');
                        });
                    } else {
                        res.status(206).send('New passwords don\'t agree!');
                    }
                } else {
                    res.status(206).send('Old password is incorrect!');
                }
            });
        });
    } else {
        res.status(401).send('Unauthorised');
    }
}
