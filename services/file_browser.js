const fs = require('fs');
const path = require('path');
const util = require('underscore');

exports.fileInterface = function(req, res) {
    var currDir = "./Resources/" + req.session.userInfo.userId;
    fs.readdir(currDir, function(err, files) {
        if (err) throw err;

        var data = [];
        files.forEach(function(file) {
            var isDirectory = fs.statSync(path.join(currDir, file)).isDirectory();
            if (isDirectory) {
                data.push({
                    Name: file,
                    IsDirectory: true,
                    Path: path.join(currDir, file)
                });
            } else {
                var ext = path.extname(file);
                data.push({
                    Name: file,
                    Ext: ext,
                    IsDirectory: false,
                    Path: path.join(currDir, file)
                });
            }
        });
        data = util.sortBy(data, function(f) {
            return f.Name
        });

        res.json(data);
    });
}

exports.retriveFile = function(req, res) {
    const filePath = req.query.p;

    if (req.session.userInfo) {
        res.redirect(filePath);
    } else {
        res.status(401).send('Unauthorised');
    }
}
