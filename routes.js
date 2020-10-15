module.exports = function(app) {
    var task = require('./controller');

    app.route('/')
        .get(task.return_entry);
    
    app.route('/index')
        .get(task.return_homepage);
        
    app.route('/signup')
        .get(task.return_signup)
        .post(task.signup_new_user);

    app.route('/dashboard')
        .get(task.return_dashboard);

    app.route('/profile')
        .get(task.return_profile);

    app.route('/settings')
        .get(task.return_settings)

    app.route('/changedetail')
        .post(task.change_reg_detail);

    app.route('/changepassword')
        .post(task.change_sens_detail);

    app.route('/signin')
        .get(task.return_signin)
        .post(task.user_login);

    app.route('/signout')
        .get(task.user_logoff);

    app.route('/iforgot')
        .get(task.return_iforgot)
        /*.post(task.forgot_password)*/;

    app.route('/proceed-register')
        .get(task.verification_email_sent);

    app.route('/proceed-reset')
        .get(task.reset_email_sent);

    app.route('/verify')
        .post(task.verify_user_email);

    app.route('/verify-email/:userid/:code')
        .get(task.verify_email_response);
  
    app.route('/newshowcase')
        .post(task.create_showcase);
        
    app.route('/showcase/:showcaseid')
        .get(task.return_showcase_page);
    
    app.route('/showcasedata')
        .get(task.return_showcase_data);
    
    app.route('/updateshowcase')
        .post(task.update_showcase);

    app.route('/resources/:mediaid')
        .get(task.return_resource);

    app.route('/upload')
        .get(task.return_showcase_page)
        .post(task.create_resource);
};