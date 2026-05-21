require('./env')
const db = require('./db')
const logger = require('./logger')
const { specs, swaggerUi } = require('./swagger')

module.exports = { db, logger, specs, swaggerUi }
