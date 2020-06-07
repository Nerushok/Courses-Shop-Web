if (process.env.NODE_ENV === 'production') {
    module.exports = require('./constants.prod')
} else {
    module.exports = require('./constants.dev')
}