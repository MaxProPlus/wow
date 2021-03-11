import './loadEnv'
import {configProvider, logger} from './modules/core'
import app from './server'

// Start the server
const port = configProvider.get<number>('port')
const server = app.listen(port, () => {
  logger.info(
    `Express server started on : http://${configProvider.get<string>(
      'host'
    )}:${port}`
  )
})

// Stop the server
const stop = () => {
  logger.info('Interrupted')
  if (!server.listening) {
    process.exit(0)
  }

  server.close((err) => {
    if (err) {
      logger.error('Error on close', err)
      process.exit(1)
    }
    process.exit(0)
  })
}

// Stop on signal
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
