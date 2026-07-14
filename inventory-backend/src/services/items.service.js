const Item = require('../models/Item')
const { SKU_EXISTS, ITEM_NOT_FOUND } = require('../constants/messages')

const FIELDS = ['sku', 'name', 'quantity', 'price', 'reorderPoint', 'supplier', 'bin', 'categoryId']

function pickFields(payload) {
  const out = {}
  for (const key of FIELDS) {
    if (payload[key] !== undefined) out[key] = payload[key]
  }
  if ('categoryId' in out && !out.categoryId) out.categoryId = null
  return out
}

async function getAllItems() {
  return Item.find().populate('categoryId', 'name').sort({ name: 1 })
}

async function getItemById(id) {
  return Item.findById(id).populate('categoryId', 'name')
}

async function createItem(payload) {
  try {
    const item = await Item.create(pickFields(payload))
    return { item }
  } catch (err) {
    if (err.code === 11000) return { error: SKU_EXISTS }
    throw err
  }
}

async function updateItem(id, payload) {
  try {
    const item = await Item.findByIdAndUpdate(id, pickFields(payload), {
      new: true,
      runValidators: true,
    }).populate('categoryId', 'name')
    if (!item) return { error: ITEM_NOT_FOUND }
    return { item }
  } catch (err) {
    if (err.code === 11000) return { error: SKU_EXISTS }
    throw err
  }
}

// Receiving stock is an increment, not a write of an absolute value — two
// people booking in deliveries at once must not overwrite each other's count.
async function receiveStock(id, { quantity, bin }) {
  const update = { $inc: { quantity } }
  if (bin) update.$set = { bin }

  const item = await Item.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  }).populate('categoryId', 'name')

  if (!item) return { error: ITEM_NOT_FOUND }
  return { item }
}

async function deleteItem(id) {
  const item = await Item.findByIdAndDelete(id)
  if (!item) return { error: ITEM_NOT_FOUND }
  return { success: true }
}

module.exports = { getAllItems, getItemById, createItem, updateItem, receiveStock, deleteItem }
