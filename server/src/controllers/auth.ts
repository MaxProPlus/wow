import AuthProvider from '../providers/auth'
import {Request, Response} from 'express'
import {User} from '../common/entity/types'
import {About} from '../entity/types'
import TokenStorage from '../services/token'

class AuthController {
  constructor(private authProvider: AuthProvider) {}

  // Аутентификация
  login = (req: Request, res: Response) => {
    const user: User = req.body
    const about = new About()
    about.ip = req.ip
    return this.authProvider.login(user, about).then((r) => {
      TokenStorage.set(res, r)
      return res.json({
        status: 'OK',
      })
    })
  }

  // Выход
  logout = (req: Request, res: Response) => {
    TokenStorage.clear(res)
    this.authProvider.logout(TokenStorage.get(req))
    return res.json({
      status: 'OK',
    })
  }
}

export default AuthController
