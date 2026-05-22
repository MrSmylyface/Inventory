const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email:    { type: String, required: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    verified: { type: Boolean, default: false },
    verificationCode: { type: String, default: null },
    role: { type: String, enum: ['admin', 'staff', 'viewer'], default: 'staff' },
  },
  { timestamps: true }
)

module.exports = mongoose.model('User', userSchema)
