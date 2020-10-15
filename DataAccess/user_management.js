var db = require('./db_interface');
var bcrypt = require('bcrypt');
var nodemailer = require('nodemailer');
var crypto = require('crypto');

exports.login = async function(req, res) {
    const email = req.body.email;
    const pwd = req.body.password;

    db.getConnection(function(err, conn) {
        conn.query("SELECT * FROM User WHERE email = ?", [email], async function (err, results) {
            if (err) throw err;

            if (results.length > 0) {
                const isVerified = await bcrypt.compare(pwd, results[0].pwd);

                if (isVerified) {
                    if (results[0].status == 'verified') {
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
                        res.status(206).send('Your account must be verified before you can login!');
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
    const pwd = req.body.password;
    const pwdAgain = req.body.confirmPassword;

    db.getConnection(async function(err, conn) {
        if (pwd.valueOf() == pwdAgain.valueOf()) {
            const pwd_ = await bcrypt.hash(req.body.password, 8);

            var sql = "INSERT INTO User (firstName, lastName, email, profileImg, pwd, extLink) VALUES " +
                "('" + firstName + "', '" + lastName + "', '" + email + "', '" + profilePicRef + "'," +
                "'" + pwd_ + "', 'https://www.facebook.com')";
            conn.query(sql, async function (err, results) {
                if (err) throw err;

                conn.release();

                exports.verifyEmail(req, res);
                res.redirect('/proceed-register');
            });
        }
    });
}

exports.verifyEmail = async function(req, res) {
    const email = req.body.email;
    const time = new Date();

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
            res.redirect('/proceed-reset');
        });
    });
}

exports.resetPassword = async function(req, res) {
    const userID = req.params.userid;
    const code = req.params.code;
    const newPwd = req.body.newPassword;
    const newPwdAgain = req.body.newPasswordAgain;

    db.getConnection(function(err, conn) {
        conn.query("SELECT * FROM User WHERE idUser = ?", [userID], async function (err, results) {
            if (err) throw err;

            if (results.length > 0) {
                conn.query("SELECT * FROM ResetCode WHERE userid = ?", [userID], async function (err, results) {
                    if (err) throw err;

                    const dbCode = results[0].code;
                    const create = results[0].createDate;
                    const current = new Date(new Date().toUTCString());
                    const diff = current.getTime() - create.getTime();

                    // Check if user has matching code
                    if (code == dbCode) {
                        // Change password to new
                        if (newPwd.valueOf() == newPwdAgain.valueOf()) {
                            const pwd = await bcrypt.hash(req.body.newPassword, 8);

                            var sql = "UPDATE User SET pwd = '" + pwd + "' WHERE idUser = '" + userID + "'";
                            conn.query(sql, function (err, results) {
                                if (err) throw err;
                            });
                        } else {
                            res.status(206).send('New passwords don\'t agree!');
                        }

                        // Delete code entry from db as no longer needed
                        var sql = "DELETE FROM ResetCode WHERE userid = '" + userID + "'";
                        conn.query(sql, function (err, results) {
                            if (err) throw err;

                            conn.release();
                            res.redirect('/signin');
                        });
                    } else {
                        res.redirect('/iforgot');
                    }
                });
            } else {
                res.status(206).send('Reset password link does no exist');
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

                res.redirect('/dashboard')
            });
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

exports.getProfileInformation = async function(req, userID, res){
    
    
    db.getConnection(function(err, conn) {
        conn.query("SELECT * FROM User WHERE idUser = ?", [userID], async function (err, results) {
            if (err) throw err;

            if (results.length > 0) {
            //TODO collect all info that is permitted and return as json
            if(req.session.idUser == userID) //CASE: all information is avaliable
            {
                var profileInfo = ({
                    firstName: results[0].firstName,
                    lastName: results[0].lastName,
                    email: results[0].email,
                    displayEmail: results[0].displayEmail,
                    socialAccounts: results[0].socialAccounts,
                    profileImg: results[0].profileImg,
                    extLink: results[0].extLink,
                    mobileNumber: results[0].mobileNumber,
                    phoneNumber: results[0].phoneNumber,
                    aboutMe: results[0].aboutMe,
                    workExperience: results[0].workExperience,
                    education: results[0].education,
                    address: results[0].address,
                    document1: results[0].document1,
                    document2: results[0].document2,
                    document3: results[0].document3,
                    document4: results[0].document4,
                    document5: results[0].document5
                });
                
                res.render('portfolio', { userInfo: profileInfo});
                return;
            }
            else if(true) //CASE: profile is not private
            {
                var profileInfo = ({
                    firstName: results[0].firstName,
                    lastName: results[0].lastName,
                    email: results[0].email,
                    displayEmail: results[0].displayEmail,
                    socialAccounts: results[0].socialAccounts,
                    profileImg: results[0].profileImg,
                    extLink: results[0].extLink,
                    mobileNumber: results[0].mobileNumber,
                    phoneNumber: results[0].phoneNumber,
                    aboutMe: results[0].aboutMe,
                    workExperience: results[0].workExperience,
                    education: results[0].education,
                    address: results[0].address,
                    document1: results[0].document1,
                    document2: results[0].document2,
                    document3: results[0].document3,
                    document4: results[0].document4,
                    document5: results[0].document5
                });
                
                res.render('portfolio', { userInfo: profileInfo});
                return;
            }
            else //CASE: profile is private
            {
                return;
            }
        }

        res.status(404).send('Profile not found');

        });
    });
}
