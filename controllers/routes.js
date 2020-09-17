module.exports = function(app) {
    var tasks = require('./controller');

    
    app.route('/home')
        .get(task.return_homepage);
        
    app.route('/signup')
        .get() //TODO return signup page resource
        .post();//TODO create new account

    app.route('/profile/:profileid')
        .get();//TODO get profile page

    app.route('/signin')
        .get()//TODO Get sign in page
        .post(); //TODO sign in to account

    app.route('/dashboard/:profileid')
        .get();//TODO get account dashboard for signed in account
    
    app.route('/resources')
        .get(task.return_resource);

};