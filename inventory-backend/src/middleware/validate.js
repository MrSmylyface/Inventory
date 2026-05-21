const ApiError = require('../utils/ApiError')

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const message = result.error.errors.map((e) => e.message).join(', ')
      return next(new ApiError(422, message))
    }
    req.body = result.data
    next()
  }
}

module.exports = validate
