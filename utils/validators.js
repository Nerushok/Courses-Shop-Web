const {body} = require('express-validator')

exports.registerValidators = [
    body('email', 'Incorrect email.')
        .isEmail()
        .normalizeEmail(),
    body('password', 'Password length should be between 8 and 120 chars.')
        .isLength({min: 8, max: 120})
        .isAlphanumeric()
        .trim(),
    body('confirm_password')
        .custom((value, {req}) => {
            if (value !== req.body.password) {
                throw new Error('Passwords are not match')
            }

            return true
        })
        .trim(),
    body('name', 'Name should be between 3 and 120 chars.')
        .isLength({min: 3, max: 120})
        .trim()
]

exports.courseValidators = [
    body('title', 'Min title length is 3 chars.').isLength({min: 3}),
    body('price', 'Enter valid price').isNumeric(),
    body('img', 'Enter correct image URL').isURL()
]