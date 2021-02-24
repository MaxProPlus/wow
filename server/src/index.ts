import './loadEnv'
import {configProvider, logger} from './modules/core'
import app from './server'

// Start the server
const port = configProvider.get<number>('port')
app.listen(port, () => {
  logger.info(
    `Express server started on : http://${configProvider.get<string>(
      'host'
    )}:${port}`
  )
})
