import {Request, Response} from 'express'
import UserProvider from '../providers/account'
import {User} from '../common/entity/types'
import Validator from '../common/validator'
import {UploadedFile} from 'express-fileupload'
import {Smtp} from '../services/smtp'
import TokenStorage from '../services/token'
import Controller from '../core/controller'
import RightProvider from '../providers/right'
import AuthProvider from '../providers/auth'

class UserController extends Controller {
    constructor(
        rightProvider: RightProvider,
        authProvider: AuthProvider,
        private userProvider: UserProvider,
        private smtp: Smtp,
        private validator: Validator
    ) {
        super(rightProvider, authProvider)
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
                status: 'UNAUTHORIZED',
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
        return this.userProvider.getGeneral(req.user!.id).then((r: any) => {
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
        user.id = req.user!.id
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
        return this.userProvider.updateAvatar(req.user!.id, req.files.avatar).then(() => {
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
