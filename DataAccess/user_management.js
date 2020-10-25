var db = require('./db_interface');

const fs = require('fs');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

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
                        req.session.userInfo = {
                            userId: results[0].idUser,
                            firstName: results[0].firstName,
                            lastName: results[0].lastName,
                            email: results[0].email,
                            profileImg: results[0].profileImg,
                            extLink: results[0].extLink,
                            privatePortfolio: results[0].profilePrivate,
                            showEmail: results[0].displayEmail,
                            showPhone: results[0].showPhoneNumber,
                            showMobile: results[0].showMobileNumber,
                            showAddress: results[0].showAddress,
                            websiteLink: results[0].websiteLink,
                            facebookLink: results[0].facebookLink,
                            linkedinLink: results[0].linkedinLink,
                            twitterLink: results[0].twitterLink,
                            instagramLink: results[0].instagramLink,
                            githubLink: results[0].githubLink,      
                            phoneNumber: results[0].phoneNumber,
                            mobileNumber: results[0].mobileNumber,
                            address: results[0].address,
                            aboutMe: results[0].aboutMe,
                            workExperience: results[0].workExperience,
                            education: results[0].education
                        };

                        conn.release();

                        fs.mkdir("./Resources/" + results[0].idUser, function(err) {
                            if (err && err.code != 'EEXIST') throw err;
                        });

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
    const profilePicRef = '/Resources/avatar/default_avatar.png';
    const pwd = req.body.password;
    const pwdAgain = req.body.confirmPassword;

    db.getConnection(async function(err, conn) {
        if (pwd.valueOf() == pwdAgain.valueOf()) {
            const pwd_ = await bcrypt.hash(req.body.password, 8);

            var sql = "INSERT INTO User (firstName, lastName, email, profileImg, pwd, extLink) VALUES " +
                "('" + firstName + "', '" + lastName + "', '" + email + "', '" + profilePicRef + "', '" + pwd_ + "')";
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
            var sql = "INSERT INTO Code (userId, code) VALUES ('" + userId + "','" + code + "') " +
                "ON DUPLICATE KEY UPDATE code = '" + code + "', createDate = UTC_TIMESTAMP()";
            conn.query(sql, [email], async function (err, results) {
                if (err) throw err;
                
                // Send verify link to email
                const url = 'localhost/verifyemail?id=' + userId + '&code=' + code; // -- to be removed
                //const url = 'https://epf.johnnybread.com/verifyemail?id=' + userId + '&code=' + code;

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

exports.verifyEmailResponse = async function(req, res)
{
    const userID = req.query.id;
    const code = req.query.code;

    db.getConnection(function(err, conn) {
        conn.query("SELECT * FROM User WHERE idUser = ?", [userID], async function (err, results) {
            if (err) throw err;

            if(results.length > 0) {
                // Check if user is not verified
                const status = results[0].status;
                if(status == 'pending') {
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
                                res.status(206).send('Verification link expired!');
                            }
                        }
                        else {
                            res.status(206).send('Verification failed!');
                        }
                    });
                }
                else {
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

            if(results.length > 0) {
                if(results[0].status == 'verified') {
                    var userId = results[0].idUser;

                    // Insert user id and reset code into db
                    var sql = "INSERT INTO ResetCode (userId, code) VALUES ('" + userId + "','" + code + "') " +
                        "ON DUPLICATE KEY UPDATE code = '" + code + "', createDate = UTC_TIMESTAMP()";
                    conn.query(sql, [email], async function (err, results) {
                        if (err) throw err;

                        // Send reset link to email
                        const url = 'localhost/resetpassword?id=' + userId + '&code=' + code; // -- to be removed
                        //const url = 'https://epf.johnnybread.com/resetpassword?id=' + userId + '&code=' + code;

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

exports.changeRegularDetails = async function(req, res) {
    if (req.session.userInfo) {
        const userID = req.session.userInfo.userId;
        const email = req.body.email;
        const firstName = req.body.firstName;
        const lastName = req.body.lastName;

        db.getConnection(function(err, conn) {
            var sql = "UPDATE User SET firstName = '" + firstName + "', lastName = '" + lastName + "'," +
                "email = '" + email + "' WHERE idUser = '" + userID + "'";
            conn.query(sql, function (err, results) {
                if (err) throw err;

                conn.release();

                req.session.userInfo.firstName = firstName;
                req.session.userInfo.lastName = lastName;
                req.session.userInfo.email = email;

                res.redirect('/settings');
            });
        });
    } else {
        res.status(401).send('Unauthorised');
    }
}

exports.changePrivacySettings = async function(req,res){
    const userID = req.session.userInfo.userId;
    
    var privatePortfolio = "";

    var showEmail = "";
    var showPhone = "";
    var showMobile = "";
    var showAddress = "";

    //Set privacy values
    if(req.body.privatePortfolio == 'on'){privatePortfolio = "checked";}

    if(req.body.showEmail == 'on'){showEmail = "checked";}
    if(req.body.showPhone =='on'){showPhone = "checked";}
    if(req.body.showMobile == 'on'){showMobile = "checked";}
    if(req.body.showAddress == 'on'){showAddress = "checked";}

    //Update database
    db.getConnection(function(err, conn) {
        var sql = "UPDATE User SET profilePrivate = '" + privatePortfolio + "', displayEmail = '" + showEmail + "', showPhoneNumber = '"+showPhone+"', showMobileNumber = '"+showMobile+"', showAddress = '"+showAddress+"' WHERE idUser = '" + userID + "'";
        conn.query(sql, function (err, results) {
            if (err) throw err;

            req.session.userInfo.privatePortfolio = privatePortfolio;
            req.session.userInfo.showEmail = showEmail;
            req.session.userInfo.showPhone = showPhone;
            req.session.userInfo.showMobile = showMobile;
            req.session.userInfo.showAddress = showAddress;

            res.redirect('/settings');

            conn.release();
        });
    });
}

exports.changeSocialMediaLinks = async function(req, res){
    const userID = req.session.userInfo.userId;

    const websiteLink = req.body.website;
    const facebookLink = req.body.facebook;
    const linkedinLink = req.body.linkedin;
    const twitterLink = req.body.twitter;
    const instagramLink = req.body.instagram;
    const githubLink = req.body.github;

    db.getConnection(function(err, conn){
        var sql = "UPDATE User SET " +
                "websiteLink = '"+websiteLink+"', " +
                "facebookLink = '"+facebookLink+"', " +
                "linkedinLink = '"+linkedinLink+"', " +
                "twitterLink = '"+twitterLink+"', " +
                "instagramLink = '"+instagramLink+"', " +
                "githubLink = '"+githubLink+"' " +
                "WHERE idUser = '"+userID+"'";

        conn.query(sql, function (err, results){
            if (err) throw err;

            req.session.userInfo.websiteLink = websiteLink;
            req.session.userInfo.facebookLink = facebookLink;
            req.session.userInfo.linkedinLink = linkedinLink;
            req.session.userInfo.twitterLink = twitterLink;
            req.session.userInfo.instagramLink = instagramLink;
            req.session.userInfo.githubLink = githubLink;

            res.redirect('/settings');

            conn.release();
        });
    });


}

exports.updateProfile = async function(req, res){
    const userID = req.session.userInfo.userId;

    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const phoneNumber = req.body.phoneNumber;
    const mobileNumber = req.body.mobileNumber;
    const address = req.body.address;
    const aboutMe = req.body.aboutMe;
    const workExperience = req.body.workExperience;
    const education = req.body.education;

    db.getConnection(function(err, conn){
        var sql = "UPDATE User SET " +
                "firstName = '"+firstName+"', " +
                "lastName = '"+lastName+"', " +
                "email = '"+email+"', " +
                "phoneNumber = '"+phoneNumber+"', " +
                "mobileNumber = '"+mobileNumber+"', " +
                "address = '"+address+"', " +
                "aboutMe = '"+aboutMe+"', " +
                "workExperience = '"+workExperience+"', " +
                "education = '"+education+"' " +
                "WHERE idUser = '"+userID+"'"
        conn.query(sql, function (err, results){
            if (err) throw err;

            req.session.userInfo.firstName = firstName;
            req.session.userInfo.lastName = lastName;
            req.session.userInfo.email = email;
            req.session.userInfo.phoneNumber = phoneNumber;
            req.session.userInfo.mobileNumber = mobileNumber;
            req.session.userInfo.address = address;
            req.session.userInfo.aboutMe = aboutMe;
            req.session.userInfo.workExperience = workExperience;
            req.session.userInfo.education = education;

            res.redirect('/settings');

            conn.release();
        });
    });
}

exports.changeAvatar = async function(req, res) {
    if (req.session.userInfo) {
        const userID = req.session.userInfo.userId;
        const ref = req.file.path.replace(/\\/g, "/");

        db.getConnection(function(err, conn) {
            var sql = "UPDATE User SET profileImg = '" + ref + "' WHERE idUser = '" + userID + "'";
            conn.query(sql, function (err, results) {
                if (err) throw err;

                conn.release();

                req.session.userInfo.profileImg = ref;

                res.redirect('/settings');
            });
        });
    } else {
        res.status(401).send('Unauthorised');
    }
}

exports.changeSensitiveDetails = async function(req, res) {
    if (req.session.userInfo) {
        const userID = req.session.userInfo.userId;
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

                            res.redirect('/settings');
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
                var profileInfo;




            if(req.session.userInfo && req.session.userInfo.userId == userID) //CASE: all information is avaliable
            {

                var profileInfo = ({
                    userID: userID,
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

                
                
            }
            else if(results[0].profilePrivate == "") //CASE: profile is not private
            {
                var profileInfo = ({
                    userID: userID,
                    firstName: results[0].firstName,
                    lastName: results[0].lastName,
                    displayEmail: results[0].displayEmail,
                    displayMobileNumber: results[0].showMobileNumber,
                    displayPhoneNumber: results[0].showPhoneNumber,
                    displayAddress: results[0].showAddress,
                    socialAccounts: results[0].socialAccounts,
                    profileImg: results[0].profileImg,
                    extLink: results[0].extLink,
                    aboutMe: results[0].aboutMe,
                    workExperience: results[0].workExperience,
                    education: results[0].education,
                    
                    email: results[0].email,
                    mobileNumber: results[0].mobileNumber,
                    phoneNumber: results[0].phoneNumber,
                    address: results[0].address,

                    document1: results[0].document1,
                    document2: results[0].document2,
                    document3: results[0].document3,
                    document4: results[0].document4,
                    document5: results[0].document5
                });

                if(profileInfo.displayEmail == "") //CASE: Check if a user wants their email publicly visible
                {
                    profileInfo.email = "";
                }

                if(profileInfo.displayMobileNumber == "") //CASE check mobile visibility
                {
                    profileInfo.mobileNumber = "";
                }

                if(profileInfo.displayPhoneNumber == "") //CASE check phone visibility
                {
                    profileInfo.phoneNumber = "";
                }

                if(profileInfo.showAddress == "") //CASE check Address visibility
                {
                    profileInfo.address = "";
                }

                

            }
            else //CASE: profile is private
            {
                res.redirect(401, '/');
                //res.status(401).send('Profile is Private');
                return;
            }
        

            //Get social media info
                profileInfo.website = "";
                profileInfo.websiteLink = "#"
                profileInfo.github = "";
                profileInfo.githubLink = "#"
                profileInfo.twitter = "";
                profileInfo.twitterLink = "#";
                profileInfo.instagram = "";
                profileInfo.instagramLink = "#";
                profileInfo.facebook = "";
                profileInfo.facebookLink = "#";
                profileInfo.linkedin = "";
                profileInfo.linkedinLink = "#";

                //website
                if(results[0].websiteLink != null && results[0].websiteLink != "")
                {
                    profileInfo.website = profileInfo.firstName + "'s Website";
                    profileInfo.websiteLink = results[0].websiteLink;
                }

                //github
                if(results[0].githubLink != null && results[0].githubLink != "")
                {
                    profileInfo.github = profileInfo.firstName + "'s GitHub";
                    profileInfo.githubLink = results[0].githubLink;
                }

                //twitter
                if(results[0].twitterLink != null && results[0].twitterLink != "")
                {
                    profileInfo.twitter = profileInfo.firstName + "'s Twitter";
                    profileInfo.twitterLink = results[0].twitterLink;
                }

                //Instagram
                if(results[0].instagramLink != null && results[0].instagramLink != "")
                {
                    profileInfo.instagram = profileInfo.firstName + "'s Instagram";
                    profileInfo.instagramLink = results[0].instagramLink;
                }

                //Facebook
                if(results[0].facebookLink != null && results[0].facebookLink != "")
                {
                    profileInfo.facebook = profileInfo.firstName + "'s Facebook";
                    profileInfo.facebookLink = results[0].facebookLink;
                }

                //LinkedIn
                if(results[0].linkedinLink != null && results[0].linkedinLink != "")
                {
                    profileInfo.linkedin = profileInfo.firstName + "'s LinkedIn";
                    profileInfo.linkedinLink = results[0].linkedinLink;
                }

                res.render('portfolio', { userInfo: profileInfo});
                return;
            }
            
        });
    });
}

exports.getProfileEdit = async function(req, res){
    if(req.session.userInfo){
        db.getConnection(function(err, conn) {
            conn.query("SELECT * FROM User WHERE idUser = ?", [req.session.userInfo.userId], async function (err, results) {
                if (err) throw err;
    
                var profileInfo = ({
                    userID: req.session.userInfo.userId,
                    firstName: results[0].firstName,
                    lastName: results[0].lastName,
                    displayEmail: results[0].displayEmail,
                    displayMobileNumber: results[0].showMobileNumber,
                    displayPhoneNumber: results[0].showPhoneNumber,
                    displayAddress: results[0].showAddress,
                    socialAccounts: results[0].socialAccounts,
                    profileImg: results[0].profileImg,
                    extLink: results[0].extLink,
                    aboutMe: results[0].aboutMe,
                    workExperience: results[0].workExperience,
                    education: results[0].education,
                    
                    email: results[0].email,
                    mobileNumber: results[0].mobileNumber,
                    phoneNumber: results[0].phoneNumber,
                    address: results[0].address,

                    document1: results[0].document1,
                    document2: results[0].document2,
                    document3: results[0].document3,
                    document4: results[0].document4,
                    document5: results[0].document5
                });

                    //Get social media info
                    profileInfo.website = "";
                    profileInfo.websiteLink = "#"
                    profileInfo.github = "";
                    profileInfo.githubLink = "#"
                    profileInfo.twitter = "";
                    profileInfo.twitterLink = "#";
                    profileInfo.instagram = "";
                    profileInfo.instagramLink = "#";
                    profileInfo.facebook = "";
                    profileInfo.facebookLink = "#";
                    profileInfo.linkedin = "";
                    profileInfo.linkedinLink = "#";

                    //website
                    if(results[0].websiteLink != null && results[0].websiteLink != "")
                    {
                        profileInfo.website = profileInfo.firstName + "'s Website";
                        profileInfo.websiteLink = results[0].websiteLink;
                    }

                    //github
                    if(results[0].githubLink != null && results[0].githubLink != "")
                    {
                        profileInfo.github = profileInfo.firstName + "'s GitHub";
                        profileInfo.githubLink = results[0].githubLink;
                    }

                    //twitter
                    if(results[0].twitterLink != null && results[0].twitterLink != "")
                    {
                        profileInfo.twitter = profileInfo.firstName + "'s Twitter";
                        profileInfo.twitterLink = results[0].twitterLink;
                    }

                    //Instagram
                    if(results[0].instagramLink != null && results[0].instagramLink != "")
                    {
                        profileInfo.instagram = profileInfo.firstName + "'s Instagram";
                        profileInfo.instagramLink = results[0].instagramLink;
                    }

                    //Facebook
                    if(results[0].facebookLink != null && results[0].facebookLink != "")
                    {
                        profileInfo.facebook = profileInfo.firstName + "'s Facebook";
                        profileInfo.facebookLink = results[0].facebookLink;
                    }

                    //LinkedIn
                    if(results[0].linkedinLink != null && results[0].linkedinLink != "")
                    {
                        profileInfo.linkedin = profileInfo.firstName + "'s LinkedIn";
                        profileInfo.linkedinLink = results[0].linkedinLink;
                    }

                res.render('portfolioedit', { userInfo: profileInfo});
            });
        });
    }
    else{
        res.redirect('/signin');
    }
}

exports.messageProfile = async function(req, res) {

    const profileID = req.body.id;
    const senderEmail = req.body.email;
    const message = req.body.message;
    const senderName = req.body.senderName;

    db.getConnection(function(err, conn) {
        conn.query("SELECT * FROM User WHERE idUser = ?", [profileID], async function (err, results) {
            if (err) throw err;

            console.log(profileID);
            console.log(senderEmail);
            console.log(message);
            console.log(senderName);

            const profileEmail = results[0].email;
            const name = results[0].firstName;

            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'smartexibit@gmail.com',
                    pass: 'rXg8d$61n7%z'
                }
            });

            var mailOptions = {
                from: 'smartexibit@gmail.com',
                to: profileEmail,
                subject: 'New Message',
                text: 'Dear ' + name +  ', you have a new message on your SmartExhibit profile.\n\n' +
                    message + '\n\nIf you wish to respond to this message, please email the messenger at:\n\n'
                    + senderEmail
            };

            transporter.sendMail(mailOptions, function(err, info) { if (err) console.log(err); });

            conn.release();
        });
    });

    res.redirect("/ext-profile/?profileID=" + profileID);
}
