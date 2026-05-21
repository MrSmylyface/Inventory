const asyncHandler = require('../utils/asyncHandler')
const ApiResponse = require('../utils/ApiResponse')
const ApiError = require('../utils/ApiError')
const itemsService = require('../services/items.service')
const { ITEM_NOT_FOUND } = require('../constants/messages')
const { OK, CREATED } = require('../constants/httpStatus')

const getAll = asyncHandler(async (req, res) => {
  const items = itemsService.getAllItems()
  res.status(OK).json(new ApiResponse(OK, items))
})

const create = asyncHandler(async (req, res) => {
  const item = itemsService.createItem(req.body)
  res.status(CREATED).json(new ApiResponse(CREATED, item))
})

const update = asyncHandler(async (req, res) => {
  const item = itemsService.updateItem(req.params.id, req.body)
  if (!item) throw new ApiError(404, ITEM_NOT_FOUND)
  res.status(OK).json(new ApiResponse(OK, item))
})

const remove = asyncHandler(async (req, res) => {
  itemsService.deleteItem(req.params.id)
  res.status(OK).json(new ApiResponse(OK, null, 'Item deleted.'))
})

module.exports = { getAll, create, update, remove }
