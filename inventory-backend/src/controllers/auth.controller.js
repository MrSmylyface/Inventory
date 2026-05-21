const asyncHandler = require('../utils/asyncHandler')
const ApiResponse = require('../utils/ApiResponse')
const ApiError = require('../utils/ApiError')
const authService = require('../services/auth.service')
const { OK } = require('../constants/httpStatus')
const {
  REGISTER_SUCCESS, VERIFY_SUCCESS, LOGIN_SUCCESS,
} = require('../constants/messages')

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body)
  if (result.error) throw new ApiError(400, result.error)
  res.status(OK).json(new ApiResponse(OK, null, REGISTER_SUCCESS))
})

const verify = asyncHandler(async (req, res) => {
  const result = authService.verify(req.body)
  if (result.error) throw new ApiError(400, result.error)
  res.status(OK).json(new ApiResponse(OK, null, VERIFY_SUCCESS))
})

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body)
  if (result.error) throw new ApiError(400, result.error)
  res.status(OK).json(new ApiResponse(OK, { tokens: result.tokens }, LOGIN_SUCCESS))
})

const refresh = asyncHandler(async (req, res) => {
  const result = authService.refresh(req.body.refreshToken)
  if (result.error) throw new ApiError(400, result.error)
  res.status(OK).json(new ApiResponse(OK, { accessToken: result.accessToken }))
})

module.exports = { register, verify, login, refresh }
