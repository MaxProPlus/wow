import {NextFunction, Request, RequestHandler, Response} from 'express'
import TokenStorage from '../services/token'
import Auth from '../services/auth'
import app from '../server'

const authId: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const auth = new Auth(app.get('db'))
    req.userId = await auth.checkAuth(TokenStorage.getToken(req)).then((id: number) => {
        return id
    }, () => {
        return 0
    })
    if (!req.userId) {
        return res.json({
            status: 'INVALID_AUTH',
            errorMessage: 'Ошибка авторизации',
        })
    }
    next()
}

export default authId