const path = require('path');

var userManagement = require('./DataAccess/user_management');
var showcase = require('./DataAccess/showcase');
var mediaResource = require('./DataAccess/resource');

var fileUpload = require('./services/file_upload');

//var User = require('./services/user.js');
//var Media = require('./services/media.js');

exports.return_entry = function(req, res) {
    if (req.session.userId) {
        res.redirect('/dashboard');
    } else {
        res.redirect('/index');
    }
}

exports.return_homepage = function(req, res) {
    res.sendFile(path.join(__dirname, '/views/homepage.html'));
}

exports.return_signin = function(req, res) {
    res.sendFile(path.join(__dirname, '/views/login.html'));
}

exports.user_login = function(req, res) {
    userManagement.login(req, res);
}

exports.user_logoff = function(req, res) {
    req.session.userId = null;
    res.redirect('/index');
}

exports.return_signup = function(req, res) {
    res.sendFile(path.join(__dirname, '/views/register.html'));
}

exports.signup_new_user = function(req, res) {
    userManagement.register(req, res);
}

exports.return_dashboard = function(req, res) {
    res.render('dashboard', { userInfo: req.session.userInfo });
}

exports.return_profile = function(req, res) {
    res.render('portfolio', { userInfo: req.session.userInfo });
}

exports.return_settings = function (req, res) {
    res.render('settings', { userInfo: req.session.userInfo });
}

exports.change_reg_detail = function(req, res) {
    userManagement.changeRegularDetails(req, res);
}

exports.return_change_password = function (req, res) {
    res.render('settings', { userInfo: req.session.userInfo });
}

exports.change_sens_detail = function(req, res) {
    userManagement.changeSensitiveDetails(req, res);
}

exports.create_resource = function(req, res) {
    //mediaResource.newMedia(req, res);
    fileUpload.upload(req, res, function(err) {
        if (err) {
            res.status(404).send('File uploading failed!');
        } else {
            res.redirect('/dashboard');
        }
    });
}

exports.return_resource = function(req, res) {
    res.status(200).send('Resource requested');
}

exports.create_showcase = function(req, res) {
    res.sendFile(path.join(__dirname, '/views/upload-file.html'));
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

exports.return_showcase_page = function(req,res){
    res.sendFile(path.join(__dirname, '/views/upload-file.html'));
}
