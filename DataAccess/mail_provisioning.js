var db = require('./db_interface');

const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'smartexibit@gmail.com',
        pass: 'rXg8d$61n7%z'
    }
});

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
            var sql = "INSERT INTO Code (userId, code) VALUES ('" + userId + "','" + code + "') " +
                "ON DUPLICATE KEY UPDATE code = '" + code + "', createDate = UTC_TIMESTAMP()";
            conn.query(sql, [email], async function (err, results) {
                if (err) throw err;

                // Send verify link to email
                const url = 'localhost/verifyemail?id=' + userId + '&code=' + code; // -- to be removed
                //const url = 'https://epf.johnnybread.com/verifyemail?id=' + userId + '&code=' + code;

                var mailOptions = {
                    from: 'smartexibit@gmail.com',
                    to: email,
                    subject: 'Verify Your Email',
                    text: 'You are receiving this email if you need to verify your email for your ' +
                        'Smart Exhibit account. Please click the link below:\n\n' + url +
                        '\n\nThis link expires in 10 minutes from the time you recieved this email.'
                };

                transporter.sendMail(mailOptions, function(err, info) { if(err) console.log(err); });

                conn.release();
            });
        });
    });
}

exports.verifyEmailResponse = async function(req, res) {
    const userID = req.query.id;
    const code = req.query.code;

    db.getConnection(function(err, conn) {
        conn.query("SELECT * FROM User WHERE idUser = ?", [userID], async function (err, results) {
            if (err) throw err;

            if (results.length > 0) {
                // Check if user is not verified
                const status = results[0].status;
                if (status == 'pending') {
                    // Check if user has matching code
                    conn.query("SELECT * FROM Code WHERE userid = ?", [userID], async function (err, results) {
                        if (err) throw err;

                        const dbCode = results[0].code;
                        const create = results[0].createDate;
                        const current = new Date(new Date().toUTCString());
                        const diff = current.getTime() - create.getTime();

                        if (code == dbCode) {
                            // Link expires after 10 minutes
                            if (diff/60000 < 10) {
                                // Create public link to profiles
                                extLink = "epf.johnnybread.com/ext-profile?profileID=" + userID;

                                var sql = "UPDATE User SET status = 'verified', extLink = '" + extLink + "' " +
                                    "WHERE idUser = '" + userID + "'";
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
                            } else {
                                // Delete code entry from db as no longer needed
                                var sql = "DELETE FROM Code WHERE userid = '" + userID + "'";
                                conn.query(sql, function (err, results) {
                                    if (err) throw err;

                                    conn.release();

                                    res.status(206).send('Verification link expired!');
                                });
                            }
                        } else {
                            res.status(206).send('Verification failed!');
                        }
                    });
                } else {
                    res.status(206).send('User email already verified');
                }
            } else {
                res.status(401).send('Unauthorised');
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

            if (results.length > 0) {
                if (results[0].status == 'verified') {
                    var userId = results[0].idUser;

                    // Insert user id and reset code into db
                    var sql = "INSERT INTO ResetCode (userId, code) VALUES ('" + userId + "','" + code + "') " +
                        "ON DUPLICATE KEY UPDATE code = '" + code + "', createDate = UTC_TIMESTAMP()";
                    conn.query(sql, [email], async function (err, results) {
                        if (err) throw err;

                        // Send reset link to email
                        const url = 'localhost/resetpassword?id=' + userId + '&code=' + code; // -- to be removed
                        //const url = 'https://epf.johnnybread.com/resetpassword?id=' + userId + '&code=' + code;

                        var mailOptions = {
                            from: 'smartexibit@gmail.com',
                            to: email,
                            subject: 'Reset Your Password',
                            text: 'You are receiving this email if you have forgotten your password to ' +
                                'your Smart Exhibit account. Please click the link below to reset your password:\n\n' +
                                url + '\n\nThis link expires in 10 minutes from the time you recieved this email.'
                        };

                        transporter.sendMail(mailOptions, function(err, info) { if (err) console.log(err); });

                        conn.release();
                    });
                } else {
                    res.status(206).send('User email is not yet verified');
                }
            }
            // Regardless of whether an email is sent or not, display message
            res.redirect('/proceed-reset');
        });
    });
}

exports.resetPassword = async function(req, res) {
    const userID = req.body.id;
    const code = req.body.code;
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
                        conn.query(sql, function(err, results) {
                            if (err) throw err;

                            conn.release();

                            res.redirect('/signin');
                        });
                    } else {
                        res.status(206).send('Verification failed!');
                    }
                });
            } else {
                res.status(401).send('Unauthorised');
            }
        });
    });
}

exports.messageProfile = async function(req, res) {
    const profileID = req.body.id;
    const senderName = req.body.senderName;
    const senderEmail = req.body.senderEmail;
    const message = req.body.message;

    db.getConnection(function(err, conn) {
        conn.query("SELECT * FROM User WHERE idUser = ?", [profileID], async function (err, results) {
            if (err) throw err;

            const recipientEmail = results[0].email;
            const recipientName = results[0].firstName;

            var mailOptions = {
                from: 'smartexibit@gmail.com',
                to: recipientEmail,
                subject: 'New Message from your ePortfolio',
                text: 'Dear ' + recipientName +  ', you have received a new message from ' + senderName
                    + ' on SmartExhibit.\n\n' + message
                    + '\n\nIf you wish to respond to this message, please email ' + senderName
                    + ' at: ' + senderEmail
            };

            transporter.sendMail(mailOptions, function(err, info) { if (err) console.log(err); });

            conn.release();
        });
    });

    res.redirect("/proceed-message");
}
