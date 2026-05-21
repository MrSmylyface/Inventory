const ApiError = require('../utils/ApiError')
const logger = require('../config/logger')

function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ success: false, error: err.message })
  }

  logger.error({ err }, 'Unhandled error')
  res.status(500).json({ success: false, error: 'Internal server error.' })
}

module.exports = errorHandler
