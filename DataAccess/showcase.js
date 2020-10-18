const { json } = require('body-parser');
var db = require('./db_interface');

exports.newShowcase = async function(req, res) {
    if (req.session.userId) {
        const userID = req.session.userId;
        const showcaseName = req.body.showcaseName;
        const privacyParam = req.body.privacyParam;

        db.getConnection(function(err, conn) {
            var sql = "INSERT INTO Showcase (idUser, showcaseName, dateCreated, privacyParam) VALUES('" + userID + "'," +
                "'" + showcaseName + "', CURDATE(),'" + privacyParam + "')";
            conn.query(sql, function (err, results) {
                if (err) throw err;

                conn.release();
                res.redirect('/dashboard/:' + req.session.userId);
            });
        });
    }
    else {
        res.status(206).send('Not Authorised to create a showcase');
    }
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
                
                //Record view on the showcase if not owning user
                if(results[0].idUser != req.session.userID)
                {
                    conn.query("INSERT INTO View (idShowcase) VALUES ('"+showcaseID+"')", {
                        
                    });
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

exports.getShowcaseStatistics = async function(req)
{
    var showcaseID = req.showcaseID;
    
    conn.query("SELECT " + 
	                "count(case WHEN timestamp_ >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE null end) AS lastWeekViews ," +
                    "count(*) AS allTimeViews" +
                "FROM View " + 
                "WHERE idShowcase = ?",
                this.showcaseID,
                async function(err, results){

        if(err) throw err;

        //TODO return Data in correct format
        if(results.length > 0)
        {
            return json({
                allTimeViews: results[0].allTimeViews,
                lastWeekViews: results[0].lastWeekViews
            });
        }
        else
        {
            return;
        }
    });
}
