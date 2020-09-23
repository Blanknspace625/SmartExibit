var path = require('path');
var User = require('./services/user');
var Database = require('./DataAccess/database');

exports.return_homepage = function(req, res) {
    res.sendFile(path.join(__dirname, '/views/homepage.html'));
}

exports.return_resource = function(req, res) {
    res.status(200).send('Resource requested');
}

exports.return_signup = function(req, res) {
    res.sendFile(path.join(__dirname, '/views/register.html'));
}

exports.signup_new_user = function(req, res) {
    Database.register(req, res);

    /*var email = req.body.email;
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var profilePictureRef = req.body.profilePictureRef;
    var password = req.body.password;

    //populate user fields from req
    let newUser = new User(email, firstName, lastName, profilePictureRef, password);

    var FieldsValid  = newUser.IsValid();

    // new user entry in database
    if (FieldsValid == "OK") {
        newUser.PushToDatabase();
        res.redirect('/signin');
    } else {
        res.status(400).send(FieldsValid);
    }*/
}

exports.return_profile = function(req, res) {
    res.status(200).send(req.session.userId + ' Profile');
}

exports.return_signin = function(req, res) {
    res.sendFile(path.join(__dirname, '/views/login.html'));
}

exports.user_login = function(req, res) {
    Database.login(req, res);

    /*var email = req.body.email;
    var pwd = req.body.password;

    let tempUser = new User(email, '', '', '', pwd);

    if (tempUser.EmailLogin()) {
        req.session.userName = req.body.email;
        res.redirect('/homepage');
    } else {
        res.status(400).send('Login failed!');
    }*/
}

exports.user_logoff = function(req, res) {
    req.session.userId = null;
    res.redirect('/homepage');
}

exports.return_dashboard = function(req, res) {
    res.status(200).send(req.session.userId + ' User Dashboard');
}

exports.return_entry = function(req, res) {
    if (req.session.userId) {
        res.redirect('/dashboard/:' + req.session.userId);
    } else {
        res.redirect('/homepage');
    }
}