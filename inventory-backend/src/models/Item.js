const mongoose = require('mongoose')

const itemSchema = new mongoose.Schema(
  {
    sku:          { type: String, required: true, unique: true, trim: true, uppercase: true },
    name:         { type: String, required: true, trim: true },
    quantity:     { type: Number, required: true, min: 0 },
    price:        { type: Number, required: true, min: 0 },
    reorderPoint: { type: Number, required: true, min: 0, default: 0 },
    supplier:     { type: String, trim: true, default: '' },
    bin:          { type: String, trim: true, uppercase: true, default: '' },
    categoryId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        delete ret._id
        return ret
      },
    },
  }
)

module.exports = mongoose.model('Item', itemSchema)
