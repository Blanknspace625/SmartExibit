const path = require('path');

var userManagement = require('./DataAccess/user_management');
var showcase = require('./DataAccess/showcase');
var mediaResource = require('./DataAccess/resource');

var fileUpload = require('./services/file_upload');
var fileBrowser = require('./services/file_browser');

//var User = require('./services/user.js');
//var Media = require('./services/media.js');

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
    userManagement.forgotPassword(req, res);
}

exports.reset_email_sent = function(req, res) {
    res.sendFile(path.join(__dirname, '/views/passwordchangesent.html'));
}

exports.return_reset_password = function(req, res) {
    res.sendFile(path.join(__dirname, '/views/passwordresetform.html'));
}

exports.reset_password = function(req, res) {
    userManagement.resetPassword(req, res);
}

exports.verification_email_sent = function(req, res) {
    res.sendFile(path.join(__dirname, '/views/verificationsent.html'));
}

exports.verify_email = function(req,res) {
    userManagement.verifyEmailResponse(req,res);
}

exports.return_dashboard = function(req, res) {
    if (req.session.userInfo) {
        res.render('dashboard', req.session);
    } else {
        res.redirect('/signin');
    }
}

exports.return_profile = function(req, res) {
    if (req.session.userInfo) {
        res.render('portfolio', req.session);
    } else {
        res.redirect('/signin');
    }
}

exports.return_settings = function (req, res) {
    if (req.session.userInfo) {
        res.render('settings', req.session);
    } else {
        res.redirect('/signin');
    }
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
            //mediaResource.newMedia(req, res);
            res.redirect('/media');
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

exports.create_showcase = function(req, res) {
    showcase.newShowcase(req, res);
}

exports.update_showcase = function(req, res) {
    showcase.updateShowcase(req, res);
}

exports.return_showcase_data = function(req, res) {
    showcase.getShowcaseData(req, res);
}

exports.return_contact = function(req, res) {
    res.sendFile(path.join(__dirname, '/views/contact-us.html'));
}
