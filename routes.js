module.exports = function(app) {
    var task = require('./controller');

    app.route('/')
        .get(task.return_website);
    
    app.route('/homepage')
        .get(task.return_homepage);
        
    app.route('/signup')
        .get(task.return_signup)
        .post(task.signup_new_user);

    app.route('/profile/:profileid')
        .get(task.return_profile);

    app.route('/signin')
        .get(task.return_signin)
        .post(task.user_login);

    app.route('/dashboard/:profileid')
        .get(task.return_dashboard);
    
    app.route('/resources')
        .get(task.return_resource);

};