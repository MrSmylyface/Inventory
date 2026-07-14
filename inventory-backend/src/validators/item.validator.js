const { z } = require('zod')

const itemSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  name: z.string().min(1, 'Name is required'),
  quantity: z.number({ invalid_type_error: 'Quantity must be a number' }).min(0, 'Quantity cannot be negative'),
  price: z.number({ invalid_type_error: 'Price must be a number' }).min(0, 'Price cannot be negative'),
  reorderPoint: z.number({ invalid_type_error: 'Reorder point must be a number' }).min(0).optional(),
  supplier: z.string().optional(),
  bin: z.string().optional(),
  categoryId: z.string().optional().nullable(),
})

// Inline edits send only the changed fields (e.g. just `quantity`), so updates
// validate a partial payload rather than the full item.
const itemUpdateSchema = itemSchema.partial()

const receiveSchema = z.object({
  quantity: z.number({ invalid_type_error: 'Quantity must be a number' }).int().positive('Quantity must be at least 1'),
  bin: z.string().optional(),
})

module.exports = { itemSchema, itemUpdateSchema, receiveSchema }
