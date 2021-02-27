import {Request, Response} from 'express'

class TokenStorage {
  // Получить токен
  static get = (req: Request) => {
    return req.cookies.token
  }

  // Установить токен
  static set = (res: Response, token: string) => {
    res.cookie('token', token)
  }

  // Очистить токен
  static clear = (res: Response) => {
    res.clearCookie('token')
  }
}

export default TokenStorage
