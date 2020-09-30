const multer = require('multer');
const path = require('path');

var storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, 'Resources');
    },
    filename: function(req, file, callback) {
        callback(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname));
    }
});

const generalMaxSize = 128 * 1000 * 1000;

exports.upload = multer({
    storage: storage,
    limits: { fileSize: generalMaxSize },
    fileFilter: function(req, file, callback) {
        //var allowedFileType = /pdf|docx|pptx/;
        //var mimetype = allowedFileType.test(file.mimetype);
        //var ext = allowedFileType.test(path.extname(file.originalname).toLowerCase());

        //if (mimetype && ext) {
            callback(null, true);
        //}
        //callback(new Error('Error: File upload only supports the ' + 'following filetypes - ' + allowedFileType));
    }
}).single('media');

const profileImgMaxSize = 5 * 1000 * 1000;

exports.uploadProfileImg = multer({
    storage: storage,
    limits: { fileSize: profileImgMaxSize },
    fileFilter: function(req, file, callback) {
        var allowedFileType = /bmp|jpg|jpeg|png/;
        var mimetype = allowedFileType.test(file.mimetype);
        var ext = allowedFileType.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && ext) {
            callback(null, true);
        }
        callback(new Error('Error: File upload only supports the ' + 'following filetypes - ' + allowedFileType));
    }
}).single('profileImg');
