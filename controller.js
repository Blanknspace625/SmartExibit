var path = require('path');
var User = require('./services/user.js');
var Media = require('./services/media.js');
var Database = require('./DataAccess/database');

exports.return_entry = function(req, res) {
    if (req.session.userId) {
        res.redirect('/dashboard/:' + req.session.userId);
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
    Database.login(req, res);
}

exports.user_logoff = function(req, res) {
    req.session.userId = null;
    res.redirect('/index');
}

exports.return_signup = function(req, res) {
    res.sendFile(path.join(__dirname, '/views/register.html'));
}

exports.signup_new_user = function(req, res) {
    Database.register(req, res);
}

exports.return_dashboard = function(req, res) {
    res.render('dashboard', { userInfo: req.session.userInfo });
}

exports.return_profile = function(req, res) {
    res.status(200).send(req.session.userId + ' Profile');
}

exports.return_settings = function (req, res) {
    res.render('settings', { userInfo: req.session.userInfo });
}

exports.change_reg_detail = function(req, res) {
    Database.changeRegularDetails(req, res);
}

exports.return_change_password = function (req, res) {
    res.render('settings', { userInfo: req.session.userInfo });
}

exports.change_sens_detail = function(req, res) {
    Database.changeSensitiveDetails(req, res);
}

exports.create_resource = function(req, res) {
    Database.newMedia(req, res);
}

exports.return_resource = function(req, res) {
    res.status(200).send('Resource requested');
}

exports.create_showcase = function(req, res) {
    res.sendFile(path.join(__dirname, '/views/upload-file.html'));
}

exports.create_showcase = function(req, res) {
    Database.newShowcase(req, res);
}

exports.update_showcase = function(req, res) {
    Database.updateShowcase(req, res);
}

exports.return_showcase_data = function(req, res) {
    Database.getShowcaseData(req, res);
}

exports.return_showcase_page = function(req,res){
    res.sendFile(path.join(__dirname, '/views/upload-file.html'));
}
