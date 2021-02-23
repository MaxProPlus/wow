import {ErrorRequestHandler, NextFunction, Request, Response} from 'express'
import {ApiError} from '../errors'
import {logger} from '../modules/core'

// middleware вывод ошибок
export const apiErrorMiddleware: ErrorRequestHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ApiError) {
        return res.json({
            status: err.name,
            errorMessage: err.message,
        })
    }
    logger.error(err.message, err)
    return res.status(500).json({
        status: 'INTERNAL_SERVER_ERROR',
        errorMessage: 'Internal Server Error',
    })
}
