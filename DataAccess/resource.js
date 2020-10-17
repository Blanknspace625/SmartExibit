var db = require('./db_interface');

exports.newMedia = async function(req, res) {
    var filePath = req.file.path.replace(/\\/g, "/");
    var showcaseID = req.body.showcaseId;

    db.getConnection(function(err, conn) {
        var sql = "INSERT INTO Media (idShowcase, content) VALUES ('" + showcaseID + "','" + filePath + "')";
        conn.query(sql, function (err, results) {
            if (err) throw err;

            conn.release();
        });
    });
}

exports.retrieveMedia = async function(req, res) {
    db.getConnection(function(err, conn) {
        var sql = "SELECT content FROM Media WHERE idMedia = ?";
        conn.query(sql, [mediaid], function (err, results) {
            if (err) throw err;

            conn.release();

            res.redirect(results[0].content);
        });
    });
}
