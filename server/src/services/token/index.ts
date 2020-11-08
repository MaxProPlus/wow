import {Request, Response} from 'express'

class TokenStorage {

    // Получить токен
    static getToken = (req: Request) => {
        return req.cookies.token
    }

    // Установить токен
    static setToken = (res: Response, token: string) => {
        res.cookie('token', token)
    }
}

export default TokenStorage