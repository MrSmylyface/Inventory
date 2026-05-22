require('./config/env')
const app = require('./app')
const { connectDB } = require('./config/db')
const logger = require('./config/logger')

const PORT = process.env.PORT || 3001

connectDB()
  .then(() => {
    app.listen(PORT, () => logger.info(`Server running on port ${PORT}`))
  })
  .catch((err) => {
    logger.error({ err }, 'Failed to connect to MongoDB')
    process.exit(1)
  })
