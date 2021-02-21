import {NextFunction, Request, RequestHandler, Response} from 'express'
import TokenStorage from '../services/token'
import {authProvider} from '../modules/app'
import {UNAUTHORIZED} from '../errors'

// прикрепить пользователя к Request
export const getUser: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    req.user = await authProvider.getUser(TokenStorage.getToken(req))
    if (!req.user) {
        return res.json(UNAUTHORIZED)
    }
    next()
}

// прикрепить пользователя с правами к Request
export const getUserWithRight: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    req.user = await authProvider.getUserWithRights(TokenStorage.getToken(req))
    if (!req.user) {
        return res.json(UNAUTHORIZED)
    }
    next()
}
