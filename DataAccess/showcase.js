const { json } = require('body-parser');
var db = require('./db_interface');

// Insert new media into showcase
exports.newMedia = async function(req, res) {
    const userID = req.session.userInfo.userId;
    const showcaseName = req.body.showcaseName;
    const privacyParam = req.body.privacyParam;
    const link = "./Resources/" + userID + "/" + req.file.originalname;

    db.getConnection(function(err, conn) {
        var sql = "INSERT INTO Showcase (idUser, showcaseName, dateCreated, privacyParam, link) VALUES('" + userID + "'," +
            "'" + showcaseName + "', CURDATE(),'" + privacyParam + "', '" + link + "')";
        conn.query(sql, function (err, results) {
            if (err) throw err;

            conn.release();

            res.redirect('/media');
        });
    });
}

// Recieve all uploaded media for an account
exports.retrieveAll = function(req, res) {
    var links = [];

    if (req.session.userInfo) {
        const userID = req.session.userInfo.userId;
        const showcaseName = req.body.showcaseName;

        db.getConnection(function(err, conn) {
            conn.query("SELECT link FROM  Showcase WHERE idUser = ?", [userID], function (err, results) {
                if (err) throw err;

                if (results.length > 0) {
                    var i;
                    for(i = 0; results[i] != null; i++) {
                        links[i] = results[i].link;
                    }
                } else {
                    res.status(206).send('No documents found');
                }

                conn.release();
            });
        });
    }
    else {
        res.status(206).send('Not Authorised to create a showcase');
    }
    return links;
}

exports.updateShowcase = async function(req, res) {
    if (req.session.userId) //Check that user is logged in
    {
        const showcaseID = req.body.showcaseID;
        const showcaseName = req.body.showcaseName;
        const privacyParam = req.body.privacyParam;
        const ownerID = req.body.ownerID;

        if (ownerID == req.session.userID) //Check that logged in user owns the showcase being modified
        {
            db.getConnection(function(err, conn) {
                var sql = "UPDATE Showcase SET showcaseName = '" + showcaseName + "', privacyParam = '" + privacyParam + "' WHERE idShowcase = '" + showcaseID + "'";
                conn.query(sql, function (err, results) {
                    if (err) throw err;

                    conn.release();
                    res.status(200).send('Showcase ' + showcaseName + ' detail(s) updated');
                });
            });
        }
    }
    else //User does not own the showcase
    {
        res.status(401).send('Unauthorised');
    }
}

exports.getShowcaseData = async function(req, res)
{
    const showcaseID = req.query.showcaseid;

    db.getConnection(function(err, conn) {
        conn.query("SELECT * FROM Showcase WHERE idShowcase = ?", showcaseID, async function (err, results) {
            if (err) throw err;

            if (results.length > 0) //case: showcase found
            {
                if (results[0].privacyParam == "Only Me" && results[0].idUser != req.session.userID) //case: User not authorised
                {
                    res.status(401).send("Not Authorised to access this content!");
                }
            


                //Return Data as a json format
                res.json({
                    idShowcase: results[0].showcaseID,
                    showcaseName: results[0].showcaseName,
                    dateCreated: results[0].dateCreated,
                    privacyParam: results[0].privacyParam,
                    idUser: results[0].idUser
                });
            }
            else //case: showcase not found
            {
                res.status(404).send("User showcase not found!")
            }

            conn.release();
        });
    });
}

exports.getShowcaseStatistics = async function(req, res)
{
    //var showcaseID = req.showcaseID;
    db.getConnection(function(err, conn) {
        conn.query("SELECT " + 
	                "count(case WHEN View.timestamp_ >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE null end) AS lastWeekViews, " +
                    "count(*) AS allTimeViews " +
                "FROM View "+
                "WHERE idUser = ? ",
                req.session.userInfo.userId,
                async function(err, results){

            if(err) throw err;

            //TODO return Data in correct format
            if(results.length > 0)
            {
                req.session.userInfo.allTimeViews = results[0].allTimeViews;
                req.session.userInfo.lastWeekViews = results[0].lastWeekViews;

                res.render('statistics', req.session);
            }
            else
            {
                res.redirect('/dashboard');
            }
        });
    });
}

