import {Express, Request, Response} from 'express'
import UserProvider from '../providers/account'
import {User, UserPassword} from '../common/entity/types'
import Validator from '../common/validator'
import {UploadedFile} from 'express-fileupload'
import {About} from '../entity/types'
import {Smtp} from '../services/smtp'
import TokenStorage from '../services/token'
import Controller from '../core/controller'

class UserController extends Controller {
    private userProvider: UserProvider
    private smtp: Smtp
    private validator: Validator

    constructor(app: Express) {
        super(app)
        const db = app.get('db')
        this.smtp = app.get('smtp')
        this.userProvider = new UserProvider(db)
        this.userProvider.setSmtp(this.smtp)
        this.validator = new Validator()
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
        return this.userProvider.signUp(user).then(() => {
            res.json({
                status: 'OK',
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
        return this.userProvider.acceptReg(token).then(() => {
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
        return this.userProvider.acceptEmail(token).then(() => {
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

    // Авторизация
    signIn = (req: Request, res: Response) => {
        const user: User = req.body
        const about = new About()
        about.ip = req.ip
        return this.userProvider.login(user, about).then((r: any) => {
            TokenStorage.setToken(res, r)
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
        this.userProvider.logout(TokenStorage.getToken(req))
        return res.json({
            status: 'OK',
        })
    }

    // Получить контекст
    getContext = (req: Request, res: Response) => {
        return this.userProvider.getContext(TokenStorage.getToken(req)).then((r: any) => {
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
        return this.userProvider.getById(id).then((r: any) => {
            return res.json({
                status: 'OK',
                results: [r],
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
        const id = await this.getUserId(req)
        if (!id) {
            return res.json({
                status: 'INVALID_AUTH',
                errorMessage: 'Ошибка авторизации',
            })
        }
        return this.userProvider.getGeneral(id).then((r: any) => {
            return res.json({
                status: 'OK',
                results: [r],
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
        return this.userProvider.getAll(limit, page, data).then((r: any) => {
            return res.json({
                status: 'OK',
                results: r,
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
        user.id = await this.getUserId(req)
        if (!user.id) {
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
        return this.userProvider.updateGeneral(user).then((r: any) => {
            return res.json({
                status: 'OK',
                results: [r],
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
            const {id} = await this.auth.checkAuthWithPassword(TokenStorage.getToken(req), user.password)
            user.id = id
        } catch (e) {
            return res.json({
                status: 'INVALID_AUTH',
                errorMessage: 'Ошибка авторизации',
            })
        }
        return this.userProvider.updateSecure(user).then(() => {
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

    // Редактирование пароля
    updatePassword = async (req: Request, res: Response) => {
        const user: UserPassword = req.body
        try {
            const {id, username} = await this.auth.checkAuthWithPassword(TokenStorage.getToken(req), user.passwordAccept)
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
        return this.userProvider.updatePassword(user).then(() => {
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
        const id = await this.getUserId(req)
        if (!id) {
            return res.json({
                status: 'INVALID_AUTH',
                errorMessage: 'Ошибка авторизации',
            })
        }
        return this.userProvider.updateAvatar(id, req.files.avatar).then(() => {
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