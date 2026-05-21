const { z } = require('zod')

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().nullable(),
})

module.exports = { categorySchema }
