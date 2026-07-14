const asyncHandler = require('../utils/asyncHandler')
const ApiResponse = require('../utils/ApiResponse')
const ApiError = require('../utils/ApiError')
const itemsService = require('../services/items.service')
const { ITEM_NOT_FOUND, ITEM_DELETED, STOCK_RECEIVED } = require('../constants/messages')
const { OK, CREATED } = require('../constants/httpStatus')

const getAll = asyncHandler(async (req, res) => {
  const items = await itemsService.getAllItems()
  res.status(OK).json(new ApiResponse(OK, items))
})

const getOne = asyncHandler(async (req, res) => {
  const item = await itemsService.getItemById(req.params.id)
  if (!item) throw new ApiError(404, ITEM_NOT_FOUND)
  res.status(OK).json(new ApiResponse(OK, item))
})

const create = asyncHandler(async (req, res) => {
  const result = await itemsService.createItem(req.body)
  if (result.error) throw new ApiError(409, result.error)
  res.status(CREATED).json(new ApiResponse(CREATED, result.item))
})

const update = asyncHandler(async (req, res) => {
  const result = await itemsService.updateItem(req.params.id, req.body)
  if (result.error) throw new ApiError(result.error === ITEM_NOT_FOUND ? 404 : 409, result.error)
  res.status(OK).json(new ApiResponse(OK, result.item))
})

const receive = asyncHandler(async (req, res) => {
  const result = await itemsService.receiveStock(req.params.id, req.body)
  if (result.error) throw new ApiError(404, result.error)
  res.status(OK).json(new ApiResponse(OK, result.item, STOCK_RECEIVED))
})

const remove = asyncHandler(async (req, res) => {
  const result = await itemsService.deleteItem(req.params.id)
  if (result.error) throw new ApiError(404, result.error)
  res.status(OK).json(new ApiResponse(OK, null, ITEM_DELETED))
})

module.exports = { getAll, getOne, create, update, receive, remove }
