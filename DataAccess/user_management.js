var db = require('./db_interface');
var mail = require('./mail_provisioning');

const fs = require('fs');
const bcrypt = require('bcrypt');

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

                            occupation: results[0].occupation,
                            phoneNumber: results[0].phoneNumber,
                            address: results[0].address,

                            privatePortfolio: results[0].profilePrivate,
                            showEmail: results[0].displayEmail,
                            showPhone: results[0].showPhoneNumber,
                            showAddress: results[0].showAddress,

                            websiteLink: results[0].websiteLink,
                            facebookLink: results[0].facebookLink,
                            linkedinLink: results[0].linkedinLink,
                            twitterLink: results[0].twitterLink,
                            instagramLink: results[0].instagramLink,
                            githubLink: results[0].githubLink,

                            aboutMe: results[0].aboutMe,
                            workExperience: results[0].workExperience,
                            education: results[0].education,

                            showcase1: results[0].document1,
                            showcase2: results[0].document2,
                            showcase3: results[0].document3,
                            showcase4: results[0].document4,
                            showcase5: results[0].document5
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

            var sql = "INSERT INTO User (firstName, lastName, email, profileImg, pwd) VALUES " +
                "('" + firstName + "', '" + lastName + "', '" + email + "', '" + profilePicRef + "', " +
                "'" + pwd_ + "')";
            conn.query(sql, async function (err, results) {
                if (err) throw err;

                conn.release();

                mail.verifyEmail(req, res);
                res.redirect('/proceed-register');
            });
        } else {
            res.status(206).send('Your passwords don\'t agree!');
        }
    });
}

exports.changeRegularDetails = async function(req, res) {
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
}

exports.changeAvatar = async function(req, res) {
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
}

exports.changeSensitiveDetails = async function(req, res) {
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
}

exports.changePrivacySettings = async function(req,res){
    const userID = req.session.userInfo.userId;

    var privatePortfolio = "";

    var showEmail = "";
    var showPhone = "";
    var showAddress = "";

    //Set privacy values
    if (req.body.privatePortfolio) { privatePortfolio = "checked"; }

    if (req.body.showEmail) { showEmail = "checked"; }
    if (req.body.showPhone) { showPhone = "checked"; }
    if (req.body.showAddress) { showAddress = "checked"; }

    //Update database
    db.getConnection(function(err, conn) {
        var sql = "UPDATE User SET profilePrivate = '" + privatePortfolio + "', displayEmail = " +
            "'" + showEmail + "', showPhoneNumber = '"+showPhone+"', " +
            "showAddress = '"+showAddress+"' WHERE idUser = '" + userID + "'";
        conn.query(sql, function (err, results) {
            if (err) throw err;

            req.session.userInfo.privatePortfolio = privatePortfolio;
            req.session.userInfo.showEmail = showEmail;
            req.session.userInfo.showPhone = showPhone;
            req.session.userInfo.showAddress = showAddress;

            res.redirect('/settings');

            conn.release();
        });
    });
}

exports.changeSocialMediaLinks = async function(req, res) {
    const userID = req.session.userInfo.userId;

    const websiteLink = req.body.website;
    const facebookLink = req.body.facebook;
    const linkedinLink = req.body.linkedin;
    const twitterLink = req.body.twitter;
    const instagramLink = req.body.instagram;
    const githubLink = req.body.github;

    db.getConnection(function(err, conn) {
        var sql = "UPDATE User SET " +
            "websiteLink = '"+websiteLink+"', " +
            "facebookLink = '"+facebookLink+"', " +
            "linkedinLink = '"+linkedinLink+"', " +
            "twitterLink = '"+twitterLink+"', " +
            "instagramLink = '"+instagramLink+"', " +
            "githubLink = '"+githubLink+"' " +
            "WHERE idUser = '"+userID+"'";

        conn.query(sql, function (err, results) {
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

exports.editProfile = async function(req, res) {
    const userID = req.session.userInfo.userId;

    const phoneNumber = req.body.phoneNumber;
    const address = req.body.address;
    const occupation = req.body.occupation;
    const aboutMe = req.body.aboutMe;
    const workExperience = req.body.workExperience;
    const education = req.body.education;

    db.getConnection(function(err, conn){
        var sql = "UPDATE User SET " +
            "phoneNumber = '"+phoneNumber+"', " +
            "address = '"+address+"', " +
            "aboutMe = '"+aboutMe+"', " +
            "workExperience = '"+workExperience+"', " +
            "education = '"+education+"', " +
            "occupation = '"+occupation+"' " +
            "WHERE idUser = '"+userID+"'"
        conn.query(sql, function (err, results) {
            if (err) console.log(err);

            req.session.userInfo.phoneNumber = phoneNumber;
            req.session.userInfo.address = address;
            req.session.userInfo.occupation = occupation;
            req.session.userInfo.aboutMe = aboutMe;
            req.session.userInfo.workExperience = workExperience;
            req.session.userInfo.education = education;

            conn.release();

            res.redirect('/profile');
        });
    });
}

function logView(req)
{
    const userID = req.query.profileID;

    db.getConnection(function(err,conn){
        conn.query("INSERT INTO View (idUser) VALUES (?)", userID, async function(err, results){
            if(err) throw err;

            conn.release();
        });
    });
}

exports.extProfileView = async function(req, res){
    const userID = req.query.profileID;

    if (userID) {
        db.getConnection(function (err, conn) {
            conn.query("SELECT * FROM User WHERE idUser = ?", [userID], async function (err, results) {
                if (err) throw err;

                logView(req);

                if (results.length > 0) {
                    if (results[0].profilePrivate == "") //CASE: profile is not private
                    {
                        var profileInfo = {
                            userID: userID,
                            firstName: results[0].firstName,
                            lastName: results[0].lastName,
                            profileImg: results[0].profileImg,

                            email: "",
                            phoneNumber: "",
                            address: "",

                            occupation: results[0].occupation,
                            aboutMe: results[0].aboutMe,
                            workExperience: results[0].workExperience,
                            education: results[0].education,

                            website: "",
                            github: "",
                            twitter: "",
                            facebook: "",
                            instagram: "",
                            linkedin: "",

                            showcase1: results[0].document1,
                            showcase2: results[0].document2,
                            showcase3: results[0].document3,
                            showcase4: results[0].document4,
                            showcase5: results[0].document5
                        };

                        if (results[0].displayEmail) //CASE: Check if a user wants their email publicly visible
                        {
                            profileInfo.email = results[0].email;
                        }

                        if (results[0].showPhoneNumber) //CASE check phone visibility
                        {
                            profileInfo.phoneNumber = results[0].phoneNumber;
                        }

                        if (results[0].showAddress) //CASE check Address visibility
                        {
                            profileInfo.address = results[0].address;
                        }

                        //website
                        if (results[0].websiteLink) {
                            profileInfo.website = profileInfo.firstName + "'s Website";
                            profileInfo.websiteLink = results[0].websiteLink;
                        }

                        //github
                        if (results[0].githubLink) {
                            profileInfo.github = profileInfo.firstName + "'s GitHub";
                            profileInfo.githubLink = results[0].githubLink;
                        }

                        //twitter
                        if (results[0].twitterLink) {
                            profileInfo.twitter = profileInfo.firstName + "'s Twitter";
                            profileInfo.twitterLink = results[0].twitterLink;
                        }

                        //Instagram
                        if (results[0].instagramLink) {
                            profileInfo.instagram = profileInfo.firstName + "'s Instagram";
                            profileInfo.instagramLink = results[0].instagramLink;
                        }

                        //Facebook
                        if (results[0].facebookLink) {
                            profileInfo.facebook = profileInfo.firstName + "'s Facebook";
                            profileInfo.facebookLink = results[0].facebookLink;
                        }

                        //LinkedIn
                        if (results[0].linkedinLink) {
                            profileInfo.linkedin = profileInfo.firstName + "'s LinkedIn";
                            profileInfo.linkedinLink = results[0].linkedinLink;
                        }

                        conn.release();

                        res.render('portfolio', { userInfo: profileInfo });
                    }
                    else //CASE: profile is private
                    {
                        res.redirect('/ext-private');
                    }
                } else {
                    res.status(404).send('Invalid profile link!');
                }
            });
        });
    } else {
        res.status(404).send('Invalid profile link!');
    }
}

