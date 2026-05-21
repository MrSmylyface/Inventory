const asyncHandler = require('../utils/asyncHandler')
const ApiResponse = require('../utils/ApiResponse')
const ApiError = require('../utils/ApiError')
const usersService = require('../services/users.service')
const { OK } = require('../constants/httpStatus')
const { USERNAME_UPDATED, PASSWORD_UPDATED } = require('../constants/messages')

const changeUsername = asyncHandler(async (req, res) => {
  const { newUsername, password } = req.body
  if (!newUsername || !password) throw new ApiError(400, 'New username and password are required.')
  const result = await usersService.changeUsername(req.user.id, { newUsername, password })
  if (result.error) throw new ApiError(result.status || 400, result.error)
  res.status(OK).json(new ApiResponse(OK, null, USERNAME_UPDATED))
})

const changePassword = asyncHandler(async (req, res) => {
  const { newPassword, password } = req.body
  if (!newPassword || !password) throw new ApiError(400, 'New password and current password are required.')
  const result = await usersService.changePassword(req.user.id, { newPassword, password })
  if (result.error) throw new ApiError(result.status || 400, result.error)
  res.status(OK).json(new ApiResponse(OK, null, PASSWORD_UPDATED))
})

module.exports = { changeUsername, changePassword }
