const constants = require('../constants/constants')

module.exports = function (toEmail, token) {
    return {
        to: toEmail,
        from: constants.SERVICE_EMAIL,
        subject: 'Reset password',
        html: `
        <h1>Forgot a password?</h1>
        <p>Click for reset password</p>
        <p><a href="${constants.BASE_DOMAIN}/auth/password/${token}">Reset password</a></p>
        <hr />
        <a href="${constants.BASE_DOMAIN}">Courses shop</a>
        `
    }
}