var mysql = require('mysql');

/* const conn = mysql.createConnection({
    host: 'epf.johnnybread.com',
    user:'js_user',
    password: 'smartexhibit',
    database: 'eportfolio'
});

conn.connect(function(err) {
    if (err) throw err;
    console.log("Database server connected!");
}); */
const pool = mysql.createPool({
    host: 'src.johnnybread.com',
    user:'js_user',
    password: 'smartexhibit',
    database: 'eportfolio',
    timezone: 'utc'
});

exports.getConnection = function(callback) {
    pool.getConnection(callback);
};
