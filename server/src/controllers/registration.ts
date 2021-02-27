import {Request, Response} from 'express'
import {User, UserPassword} from '../common/entity/types'
import RegistrationProvider from '../providers/registration'
import Validator from '../common/validator'
import TokenStorage from '../services/token'
import AuthProvider from '../providers/auth'
import {UnauthorizedError, ValidationError} from '../errors'

class RegistrationController {
  constructor(
    private registrationProvider: RegistrationProvider,
    private authProvider: AuthProvider,
    private validator: Validator
  ) {}

  // Регистрация
  signUp = (req: Request, res: Response) => {
    const user: User = req.body
    const err = this.validator.validateSignup(user)
    if (err) {
      throw new ValidationError(err)
    }
    return this.registrationProvider.signUp(user).then((msg) => {
      res.json({
        status: 'OK',
        results: msg,
      })
    })
  }

  // Подтверждение регистрации
  acceptReg = (req: Request, res: Response) => {
    const token = req.query.token as string
    return this.registrationProvider.acceptReg(token).then(() => {
      return res.json({
        status: 'OK',
      })
    })
  }

  // Подтверждение смены email
  acceptEmail = (req: Request, res: Response) => {
    const token = req.query.token as string
    return this.registrationProvider.acceptEmail(token).then(() => {
      return res.json({
        status: 'OK',
      })
    })
  }

  // Редактирование настроек безопасноти
  updateSecure = async (req: Request, res: Response) => {
    const user: User = req.body
    const err = this.validator.validateEmail(user)
    if (err) {
      throw new ValidationError(err)
    }
    const dbUser = await this.authProvider.getUserByTokenAndPassword(
      TokenStorage.get(req),
      user.password
    )
    if (!dbUser) {
      throw new UnauthorizedError()
    }
    user.id = dbUser.id
    return this.registrationProvider.updateSecure(user).then((msg) => {
      return res.json({
        status: 'OK',
        results: msg,
      })
    })
  }

  // Редактирование пароля
  updatePassword = async (req: Request, res: Response) => {
    const user: UserPassword = req.body
    const dbUser = await this.authProvider.getUserByTokenAndPassword(
      TokenStorage.get(req),
      user.passwordAccept
    )
    if (!dbUser) {
      throw new UnauthorizedError()
    }
    user.id = dbUser.id
    user.username = dbUser.username
    const err = this.validator.validatePassword(user)
    if (err) {
      throw new ValidationError(err)
    }
    return this.registrationProvider.updatePassword(user).then(() => {
      return res.json({
        status: 'OK',
      })
    })
  }
}

export default RegistrationController
