var express = require('express');
var session = require('express-session');

var User = require('../services/user.js')


exports.return_homepage = function(req, res){
    res.status(200).send('Homepage');
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

    //populate user fields from req
    let newUser = new User(email, firstName, lastName, profilePictureRef);

    var FieldsValid  = newUser.IsValid();

    //new user entry in database
    if(FieldsValid == "OK")
    {
        newUser.PushToDatabase();
        res.sendStatus(200).redirect('/signin');
    }
    else
    {
        res.sendStatus(400);
    }
}

exports.return_profile = function(req, res){
    res.status(200).send('profile');
}

exports.return_signin = function(req, res){
    res.status(200).send('Sign in page');
}

exports.user_login = function(req, res){
    res.status(200).send('Login attempt');
}

exports.return_dashboard = function(req, res){
    res.status(200).send('User Dashboard');
}

exports.return_website = function(req, res){
    res.status(200).send('request website -> Check if session');
}