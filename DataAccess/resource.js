var db = require('./db_interface');

exports.newMedia = async function(req, res) {
    var URL = req.body.link;
    var showcaseID = req.body.showcaseid;

    db.getConnection(function(err, conn) {
        var sql = "INSERT INTO Media (idShowcase, content) VALUES ('" + showcaseID + "','" + URL + "')";
        conn.query(sql, function (err, results) {
            if (err) throw err;
            console.log("1 record inserted");
            conn.release();
        });
    });
}

exports.retrieveMedia = async function(req, res) {
    db.getConnection(function(err, conn) {
        var sql = "SELECT content FROM Media WHERE idMedia = ?";
        conn.query(sql, [mediaid], function (err, results) {
            if (err) throw err;
            res.redirect(results[0].content);
            conn.release();
        });
    });
}
