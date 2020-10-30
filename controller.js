const path = require('path');

var userManagement = require('./DataAccess/user_management');
var mailer = require('./DataAccess/mail_provisioning');
var showcase = require('./DataAccess/showcase');

var fileUpload = require('./services/file_upload');
var fileBrowser = require('./services/file_browser');

exports.return_entry = function(req, res) {
    if (req.session.userInfo) {
        res.redirect('/dashboard');
    } else {
        res.redirect('/index');
    }
}

exports.return_homepage = function(req, res) {
    res.sendFile(path.join(__dirname, '/views/homepage.html'));
}

exports.return_contact = function(req, res) {
    res.sendFile(path.join(__dirname, '/views/contact-us.html'));
}

exports.return_about = function(req, res) {
    res.sendFile(path.join(__dirname, '/views/about-us.html'));
}

exports.return_signin = function(req, res) {
    if (req.session.userInfo) {
        res.redirect('/dashboard');
    } else {
        res.sendFile(path.join(__dirname, '/views/login.html'));
    }
}

exports.user_login = function(req, res) {
    userManagement.login(req, res);
}

exports.user_logoff = function(req, res) {
    req.session.userInfo = null;
    res.redirect('/index');
}

exports.return_signup = function(req, res) {
    res.sendFile(path.join(__dirname, '/views/register.html'));
}

exports.signup_new_user = function(req, res) {
    userManagement.register(req, res);
}

exports.return_iforgot = function(req, res) {
    res.sendFile(path.join(__dirname, '/views/passwordreset.html'));
}

exports.forgot_password = function(req, res) {
    mailer.forgotPassword(req, res);
}

exports.reset_email_sent = function(req, res) {
    res.sendFile(path.join(__dirname, '/views/passwordchangesent.html'));
}

exports.return_reset_password = function(req, res) {
    res.sendFile(path.join(__dirname, '/views/passwordresetform.html'));
}

exports.reset_password = function(req, res) {
    mailer.resetPassword(req, res);
}

exports.verification_email_sent = function(req, res) {
    res.sendFile(path.join(__dirname, '/views/verificationsent.html'));
}

exports.verify_email = function(req, res) {
    mailer.verifyEmailResponse(req, res);
}

exports.return_dashboard = function(req, res) {
    if (req.session.userInfo) {
        res.render('dashboard', req.session);
    } else {
        res.redirect('/signin');
    }
}

exports.return_profile = function(req, res) {
    userManagement.extProfileView(req, res);
}

exports.return_profile_unavailable = function(req, res) {
    res.sendFile(path.join(__dirname, '/views/privacynotice.html'));
}

exports.return_my_profile = function(req, res) {
    if (req.session.userInfo) {
        res.render('portfolioedit', req.session);
    } else {
        res.redirect('/signin');
    }
}

exports.edit_profile_info = function(req, res) {
    userManagement.editProfile(req, res);
}

exports.return_settings = function (req, res) {
    if (req.session.userInfo) {
        res.render('settings', req.session);
    } else {
        res.redirect('/signin');
    }
}

exports.message_profile = function(req, res) {
    mailer.messageProfile(req, res);
}

exports.message_sent = function(req, res) {
    res.sendFile(path.join(__dirname, '/views/messagesent.html'));
}

exports.change_reg_detail = function(req, res) {
    userManagement.changeRegularDetails(req, res);
}

exports.change_profile_pic = function(req, res) {
    fileUpload.uploadProfileImg(req, res, function(err) {
        if (err) {
            res.status(404).send(err);
        } else {
            userManagement.changeAvatar(req, res);
        }
    });
}

exports.change_sens_detail = function(req, res) {
    userManagement.changeSensitiveDetails(req, res);
}

exports.change_profile_privacy = function(req, res) {
    userManagement.changePrivacySettings(req, res);
}

exports.link_social_media = function(req, res) {
    userManagement.changeSocialMediaLinks(req, res);
}

exports.return_resource_upload = function(req, res) {
    if (req.session.userInfo) {
        res.render('upload-file', req.session);
    } else {
        res.redirect('/signin');
    }
}

exports.create_resource = function(req, res) {
    fileUpload.upload(req, res, function(err) {
        if (err) {
            res.status(404).send(err);
        } else {
            showcase.newMedia(req, res);
        }
    });
}

exports.return_resource = function(req, res) {
    if (req.session.userInfo) {
        res.render('showcaselocal', req.session);
    } else {
        res.redirect('/signin');
    }
}

exports.resource_handler = function(req, res) {
    fileBrowser.fileInterface(req, res);
}

exports.retrive_resource = function(req, res) {
    fileBrowser.retriveFile(req, res);
}

exports.update_showcase = function(req, res) {
    showcase.updateShowcase(req, res);
}

exports.return_showcase_data = function(req, res) {
    showcase.getShowcaseData(req, res);
}

exports.retrieve_media = function(req, res) {
    var list = showcase.retrieveAll(req, res);

    console.log(list);
    var i;
    for (i=0; i  < list.length; i++) {
        console.log(list[i]);
    }
}

exports.return_stats_page = function(req, res) {
    if (req.session.userInfo) {
        showcase.getShowcaseStatistics(req, res);
    } else {
        res.redirect('/signin');
    }
}

exports.return_not_found = function(req, res) {
    res.sendFile(path.join(__dirname, '/views/notfound.html'));
}
 