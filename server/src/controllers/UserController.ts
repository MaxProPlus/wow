import {Express, Request, Response} from 'express'
import UserModel from '../models/account/model'
import Auth from '../services/auth'
import {User, UserPassword} from '../common/entity/types'
import Validator from '../common/validator'
import {UploadedFile} from 'express-fileupload'
import {About} from '../entity/types'
import {Smtp} from '../services/smtp'

class UserController {
    validator = new Validator()
    private userModel: UserModel
    private auth: Auth
    private smtp: Smtp

    constructor(app: Express) {
        const db = app.get('db')
        this.smtp = app.get('smtp')
        this.userModel = new UserModel(db)
        this.auth = new Auth(db)
    }

    // Регистрация
    signUp = (req: Request, res: Response) => {
        const user: User = req.body
        const err = this.validator.validateSignup(user)
        if (!!err) {
            return res.json({
                status: 'INVALID_DATA',
                errorMessage: err,
            })
        }
        return this.userModel.signUp(user).then((token: string) => {
            this.smtp.sendConfirmation(user.email, user.nickname, token).then(() => {
                return res.json({
                    status: 'OK',
                })
            }, () => {
                return res.json({
                    status: 'ERROR',
                    errorMessage: 'Ошибка при отправке сообщения. Если ошибка повториться, то свяжитесь с администрацией'
                })
            })
        }, () => {
            return res.json({
                status: 'ERROR',
                errorMessage: 'Ошибка регистрации, возможно логин или email уже занят',
            })
        })
    }

    // Подтверждение регистрации
    acceptReg = (req: Request, res: Response) => {
        const token = req.query.token as string
        return this.userModel.acceptReg(token).then(() => {
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

    // Подтверждение email
    acceptEmail = (req: Request, res: Response) => {
        const token = req.query.token as string
        return this.userModel.acceptEmail(token).then(() => {
            return res.json({
                status: 'OK',
            })
        }, (err) => {
            return res.json({
                status: 'ERROR',
                errorMessage: 'Ошибка, неверный токен',
            })
        })
    }

    // Авторизация
    signIn = (req: Request, res: Response) => {
        const user: User = req.body
        const about = new About()
        about.ip = req.ip
        return this.userModel.login(user, about).then((r: any) => {
            res.cookie('token', r)
            return res.json({
                status: 'OK',
            })
        }, () => {
            return res.json({
                status: 'ERROR',
                errorMessage: 'Неверный логин или пароль',
            })
        })
    }

    // Выход
    logout = (req: Request, res: Response) => {
        res.clearCookie('token')
        this.userModel.logout(req.cookies.token)
        return res.json({
            status: 'OK',
        })
    }

    // Получить контекст
    getContext = (req: Request, res: Response) => {
        return this.userModel.getContext(req.cookies.token).then((r: any) => {
            return res.json({
                status: 'OK',
                results: [r],
            })
        }, () => {
            res.clearCookie('token')
            return res.json({
                status: 'INVALID_AUTH',
                errorMessage: 'Ошибка авторизации',
            })
        })
    }

    // Получить пользователя по id
    getUser = (req: Request, res: Response) => {
        const id = parseInt(req.params.id)
        if (isNaN(id)) {
            return res.json({
                status: 'INVALID_PARSE',
                errorMessage: 'Ошибка парсинга id',
            })
        }
        return this.userModel.getById(id).then((r: any) => {
            return res.json({
                status: 'OK',
                results: [r]
            })
        }, (err: any) => {
            return res.json({
                status: 'ERROR',
                errorMessage: err,
            })
        })
    }

    // Получить информацию о пользователе
    getGeneral = async (req: Request, res: Response) => {
        let id
        try {
            id = await this.auth.checkAuth(req.cookies.token)
        } catch (err) {
            return res.json({
                status: 'INVALID_AUTH',
                errorMessage: 'Ошибка авторизации',
            })
        }
        return this.userModel.getGeneral(id).then((r: any) => {
            return res.json({
                status: 'OK',
                results: [r]
            })
        }, (err) => {
            return res.json({
                status: 'ERROR',
                errorMessage: err,
            })
        })
    }

    // Получить всех пользователей
    getAll = (req: Request, res: Response) => {
        const limit = parseInt(req.query.limit as string) || 10
        const page = parseInt(req.query.page as string) || 1
        const data: any = {}
        if (!!req.query.nickname) {
            data.nickname = req.query.nickname
        }
        return this.userModel.getAll(limit, page, data).then((r: any) => {
            return res.json({
                status: 'OK',
                results: r
            })
        }, (err: any) => {
            return res.json({
                status: 'ERROR',
                errorMessage: err,
            })
        })
    }

    // Редактирование основной информации
    updateGeneral = async (req: Request, res: Response) => {
        const user: User = req.body
        try {
            user.id = await this.auth.checkAuth(req.cookies.token)
        } catch (err) {
            return res.json({
                status: 'INVALID_AUTH',
                errorMessage: 'Ошибка авторизации',
            })
        }
        const err = this.validator.validateGeneral(user)
        if (!!err) {
            return res.json({
                status: 'INVALID_DATA',
                errorMessage: err,
            })
        }
        return this.userModel.updateGeneral(user).then((r: any) => {
            return res.json({
                status: 'OK',
                results: [r]
            })
        }, (err: any) => {
            return res.json({
                status: 'ERROR',
                errorMessage: err,
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
        try {
            const {id} = await this.auth.checkAuthWithPassword(req.cookies.token, user.password)
            user.id = id
        } catch (e) {
            return res.json({
                status: 'INVALID_AUTH',
                errorMessage: 'Ошибка авторизации',
            })
        }
        return this.userModel.updateSecure(user).then((token) => {
            this.smtp.sendChangeEmail(user.email, token).then(() => {
                return res.json({
                    status: 'OK',
                })
            }, () => {
                return res.json({
                    status: 'ERROR',
                    errorMessage: 'Ошибка при отправке сообщения. Если ошибка повториться, то свяжитесь с администрацией'
                })
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
        try {
            const {id, username} = await this.auth.checkAuthWithPassword(req.cookies.token, user.passwordAccept)
            user.id = id
            user.username = username
        } catch (err) {
            return res.json({
                status: 'INVALID_AUTH',
                errorMessage: 'Ошибка авторизации',
            })
        }
        const err = this.validator.validatePassword(user)
        if (!!err) {
            return res.json({
                status: 'INVALID_DATA',
                errorMessage: err,
            })
        }
        return this.userModel.updatePassword(user).then(() => {
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

    // Загрузка аватарки
    updateAvatar = async (req: Request, res: Response) => {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.json({
                status: 'INVALID_DATA',
                errorMessage: 'Не прикреплен файл',
            })
        }
        const err = this.validator.validateImg(req.files.avatar as UploadedFile)
        if (!!err) {
            return res.json({
                status: 'INVALID_DATA',
                errorMessage: err,
            })
        }
        let id
        try {
            id = await this.auth.checkAuth(req.cookies.token)
        } catch (err) {
            return res.json({
                status: 'INVALID_AUTH',
                errorMessage: 'Ошибка авторизации',
            })
        }
        return this.userModel.updateAvatar(id, req.files.avatar).then(() => {
            return res.json({
                status: 'OK',
            })
        }, (err) => {
            return res.json({
                status: 'ERROR',
                errorMessage: err,
            })
        })
    }
}

export default UserController
