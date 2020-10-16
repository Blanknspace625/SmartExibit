const multer = require('multer');
const fs = require('fs');

var storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, "./Resources/" + req.session.userId);
    },
    filename: function(req, file, callback) {
        callback(null, file.originalname);
    }
});

const generalMaxSize = 128 * 1000 * 1000;

exports.upload = multer({
    storage: storage,
    limits: { fileSize: generalMaxSize },
    fileFilter: function(req, file, callback) {
        if (!file.originalname.match(/\.(pdf|docx|pptx)$/)) {
            callback(new Error('Error: Only PDF, PowerPoint and Word files are allowed!'));
        } else {
            callback(null, true);
        }
    }
}).single('media');

const profileImgMaxSize = 5 * 1000 * 1000;

exports.uploadProfileImg = multer({
    storage: storage,
    limits: { fileSize: profileImgMaxSize },
    fileFilter: function(req, file, callback) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|bmp)$/)) {
            callback(new Error('Error: Profile picture does not support files other than images!'));
        } else {
            callback(null, true);
        }
    }
}).single('profileImg');
