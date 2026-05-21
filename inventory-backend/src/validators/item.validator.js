const { z } = require('zod')

const itemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  quantity: z.number({ invalid_type_error: 'Quantity must be a number' }),
  price: z.number({ invalid_type_error: 'Price must be a number' }),
  categoryId: z.string().optional().nullable(),
})

module.exports = { itemSchema }
