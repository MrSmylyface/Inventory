require('./config/env')
const express = require('express')
const cors = require('cors')
const pinoHttp = require('pino-http')
const logger = require('./config/logger')
const { specs, swaggerUi } = require('./config/swagger')
const routes = require('./routes')
const errorHandler = require('./middleware/errorHandler')
const notFound = require('./middleware/notFound')
const rateLimiter = require('./middleware/rateLimiter')

const app = express()

app.use(cors())
app.use(express.json())
app.use(pinoHttp({ logger }))
app.use(rateLimiter)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))
app.use('/api', routes)
app.use(notFound)
app.use(errorHandler)

module.exports = app
