import cookieParser from 'cookie-parser'
import fileUpload from 'express-fileupload'
import path from 'path'
import helmet from 'helmet'
import morgan from 'morgan'

import express, {NextFunction, Request, Response} from 'express'
import 'express-async-errors'

import initApiRouter from './routes'
import logger from './services/logger'

// Init express
const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())
app.use(fileUpload())

// Show routes called in console during development
if (process.env.NODE_ENV === 'development') {
    // @ts-ignore
    app.use(morgan('dev'))
}

if (process.env.NODE_ENV === 'production') {
    app.use(helmet())
}

app.use('/api', initApiRouter())

// Print API errors
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    logger.error(err.message, err)
    return res.status(400).json({
        status: 'ERROR',
        errorMessage: err.message,
    })
})

// Статика фронта
app.use(express.static(path.join(__dirname, '../../client/build')))
// Статика загруженных файлов
app.use(express.static(path.join(__dirname, '../upload')))

// Единый вход фронта
app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../../client/build/index.html'))
})

export default app
