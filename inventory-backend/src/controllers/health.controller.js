const { OK } = require('../constants/httpStatus')

function check(req, res) {
  res.status(OK).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  })
}

module.exports = { check }
