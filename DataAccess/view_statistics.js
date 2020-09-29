var db = require('./db_interface');

exports.newView = async function(ShowcaseID)
{
    db.getConnection(function(err, conn) {
        var sql = "INSERT INTO View (idShowcase, timestamp_) VALUES ('" + ShowcaseID + "'," +
            "CURRENT_TIMESTAMP())";
        conn.query(sql, function (err, results) {
            if (err) throw err;

            conn.release();
        });
    });
}

exports.getTotalViews = async function(ShowcaseID)
{
    db.getConnection(function(err, conn) {
        var sql = "SELECT COUNT(idView) FROM View WHERE idShowcase = '"+ShowcaseID+"'";
        conn.query(sql, function (err, results) {
            if (err) throw err;

            return json({
                idView: results[0].idView,
                idShowcase: results[0].idShowcase,
                timestamp_: results[0].timestamp_,
            });

            conn.release();
        });
    });
}