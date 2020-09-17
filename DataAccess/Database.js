const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: 'mydb.com', 
    user:'myUser', 
    password: 'myPassword',
    connectionLimit: 5
});
