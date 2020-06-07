const constants = require('../constants/constants')

module.exports = function (toEmail) {
    return {
        to: toEmail,
        from: constants.SERVICE_EMAIL,
        subject: 'Account was created',
        html: `
        <h1>Welcome to our shop</h1>
        <p>You was successfully created account with email - ${toEmail}.</p>
        <hr />
        <a href="${constants.BASE_DOMAIN}">Courses shop</a>
        `
    }
}