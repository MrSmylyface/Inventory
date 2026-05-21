const asyncHandler = require('../utils/asyncHandler')
const ApiResponse = require('../utils/ApiResponse')
const ApiError = require('../utils/ApiError')
const categoriesService = require('../services/categories.service')
const { CATEGORY_NOT_FOUND } = require('../constants/messages')
const { OK, CREATED } = require('../constants/httpStatus')

const getAll = asyncHandler(async (req, res) => {
  const categories = categoriesService.getAll()
  res.status(OK).json(new ApiResponse(OK, categories))
})

const create = asyncHandler(async (req, res) => {
  const category = await categoriesService.create(req.body)
  if (category.error) throw new ApiError(409, category.error)
  res.status(CREATED).json(new ApiResponse(CREATED, category))
})

const update = asyncHandler(async (req, res) => {
  const category = await categoriesService.update(req.params.id, req.body)
  if (!category) throw new ApiError(404, CATEGORY_NOT_FOUND)
  res.status(OK).json(new ApiResponse(OK, category))
})

const remove = asyncHandler(async (req, res) => {
  categoriesService.remove(req.params.id)
  res.status(OK).json(new ApiResponse(OK, null, 'Category deleted.'))
})

module.exports = { getAll, create, update, remove }
