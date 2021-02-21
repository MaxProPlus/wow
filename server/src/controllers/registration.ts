import {Request, Response} from 'express'
import {User, UserPassword} from '../common/entity/types'
import RegistrationProvider from '../providers/registration'
import Validator from '../common/validator'
import TokenStorage from '../services/token'
import AuthProvider from '../providers/auth'

class RegistrationController {
    constructor(
        private registrationProvider: RegistrationProvider,
        private authProvider: AuthProvider,
        private validator: Validator
    ) {
    }

    // Регистрация
    signUp = (req: Request, res: Response) => {
        const user: User = req.body
        const err = this.validator.validateSignup(user)
        if (err) {
            return res.json({
                status: 'INVALID_DATA',
                errorMessage: err,
            })
        }
        return this.registrationProvider.signUp(user).then((msg: string) => {
            res.json({
                status: 'OK',
                results: msg,
            })
        }, (err) => {
            return res.json({
                status: 'ERROR',
                errorMessage: err,
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
        }, () => {
            return res.json({
                status: 'ERROR',
                errorMessage: 'Ошибка регистрации, неверный токен',
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
        }, () => {
            return res.json({
                status: 'ERROR',
                errorMessage: 'Ошибка, неверный токен',
            })
        })
    }

    // Редактирование настроек безопасноти
    updateSecure = async (req: Request, res: Response) => {
        const user: User = req.body
        const err = this.validator.validateEmail(user)
        if (!!err) {
            return res.json({
                status: 'INVALID_DATA',
                errorMessage: err,
            })
        }
        const dbUser = await this.authProvider.getUserByTokenAndPassword(TokenStorage.getToken(req), user.password)
        if (!dbUser) {
            return res.json({
                status: 'UNAUTHORIZED',
                errorMessage: 'Ошибка авторизации',
            })
        }
        user.id = dbUser.id
        return this.registrationProvider.updateSecure(user).then((msg) => {
            return res.json({
                status: 'OK',
                results: msg,
            })
        }, (err: any) => {
            return res.json({
                status: 'ERROR',
                errorMessage: err,
            })
        })
    }

    // Редактирование пароля
    updatePassword = async (req: Request, res: Response) => {
        const user: UserPassword = req.body
        const dbUser = await this.authProvider.getUserByTokenAndPassword(TokenStorage.getToken(req), user.passwordAccept)
        if (!dbUser) {
            return res.json({
                status: 'UNAUTHORIZED',
                errorMessage: 'Ошибка авторизации',
            })
        }
        user.id = dbUser.id
        user.username = dbUser.username
        const err = this.validator.validatePassword(user)
        if (err) {
            return res.json({
                status: 'INVALID_DATA',
                errorMessage: err,
            })
        }
        return this.registrationProvider.updatePassword(user).then(() => {
            return res.json({
                status: 'OK',
            })
        }, (err: any) => {
            return res.json({
                status: 'ERROR',
                errorMessage: err,
            })
        })
    }
}

export default RegistrationController