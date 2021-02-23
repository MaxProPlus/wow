import cookieParser from 'cookie-parser'
import fileUpload from 'express-fileupload'
import path from 'path'
import helmet from 'helmet'
import morgan from 'morgan'

import express, {Request, Response} from 'express'
import 'express-async-errors'

import initApiRouter from './routes'
import {apiErrorMiddleware} from './middlewares/apiError'
import {configProvider} from './modules/core'

// Init express
const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())
app.use(fileUpload())

// Show routes called in console during development
if (configProvider.get<string>('env') === 'development') {
    // @ts-ignore
    app.use(morgan('dev'))
}

if (configProvider.get<string>('env') === 'production') {
    app.use(helmet())
}

app.use('/api', initApiRouter())

// Print errors
app.use(apiErrorMiddleware)

// Статика фронта
app.use(express.static(path.join(__dirname, '../../client/build')))
// Статика загруженных файлов
app.use(express.static(path.join(__dirname, '../upload')))

// Единый вход фронта
app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../../client/build/index.html'))
})

export default app
