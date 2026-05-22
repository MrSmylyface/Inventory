const mongoose = require('mongoose')

const itemSchema = new mongoose.Schema(
  {
    name:       { type: String, required: true, trim: true },
    quantity:   { type: Number, required: true },
    price:      { type: Number, required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Item', itemSchema)
