var path = require('path');
var User = require('./services/user.js');

exports.return_homepage = function(req, res){
    res.sendFile(path.join(__dirname, '/views/homepage.html'));
}

exports.return_resource = function(req, res){
    res.status(200).send('Resource requested');
}

exports.return_signup = function(req, res){
    res.status(200).send('Sign up page');
}

exports.signup_new_user = function(req, res){
    var email = req.body.email;
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var profilePictureRef = req.body.profilePictureRef;
    var password = req.body.password;

    //populate user fields from req
    let newUser = new User(email, firstName, lastName, profilePictureRef, password);

    var FieldsValid  = newUser.IsValid();

    //new user entry in database
    if(FieldsValid == "OK")
    {
        newUser.PushToDatabase();
        res.redirect('/signin');
    }
    else
    {
        res.status(400).send(FieldsValid);
    }
}

exports.return_profile = function(req, res){
    res.status(200).send('profile');
}

exports.return_signin = function(req, res){
    res.sendFile(path.join(__dirname, '/views/login.html'));
}

exports.user_login = function(req, res){
    var email = req.body.email;
    var pwd = req.body.password;

    let tempUser = new User(email, '', '', '', pwd);

    if (tempUser.EmailLogin()) {
        req.session.userName = req.body.email;
        res.redirect('/homepage');
    }
    else {
        res.json({ret_code : 1, ret_msg : 'Login failed!'});
    }
}

exports.return_dashboard = function(req, res){
    res.status(200).send(req.profileid +' User Dashboard');
}

exports.return_website = function(req, res){
    res.status(200).send('request website -> Check if session');
}