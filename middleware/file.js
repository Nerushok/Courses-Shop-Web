const multer = require('multer')

const allowedImageTypes = ['image/png', 'image/jpg', 'image/jpeg']

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'images')
    },
    filename(req, file, cb) {
        cb(null, new Date().toISOString() + '-' + file.originalname)
    }
})
const fileFilter = (res, file, cb) => {
    if (allowedImageTypes.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

module.exports = multer({
    storage: storage,
    fileFilter: fileFilter
})