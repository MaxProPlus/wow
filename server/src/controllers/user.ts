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
import {FileError, ParseError, UnauthorizedError, ValidationError} from '../errors'

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
        return this.userProvider.getContext(TokenStorage.getToken(req)).then((r) => {
            return res.json({
                status: 'OK',
                results: [r],
            })
        }, (err: Error) => {
            if (err instanceof UnauthorizedError) {
                res.clearCookie('token')
            }
            throw err
        })
    }

    // Получить пользователя по id
    getUser = (req: Request, res: Response) => {
        const id = parseInt(req.params.id)
        if (isNaN(id)) {
            throw new ParseError()
        }
        return this.userProvider.getById(id).then((r) => {
            return res.json({
                status: 'OK',
                results: [r],
            })
        })
    }

    // Получить информацию о пользователе
    getGeneral = async (req: Request, res: Response) => {
        return this.userProvider.getGeneral(req.user!.id).then((r) => {
            return res.json({
                status: 'OK',
                results: [r],
            })
        })
    }

    // Получить всех пользователей
    getAll = (req: Request, res: Response) => {
        const limit = parseInt(req.query.limit as string) || 10
        const page = parseInt(req.query.page as string) || 1
        const data: any = {}
        if (req.query.nickname) {
            data.nickname = req.query.nickname
        }
        return this.userProvider.getAll(limit, page, data).then((r) => {
            return res.json({
                status: 'OK',
                results: r,
            })
        })
    }

    // Редактирование основной информации
    updateGeneral = async (req: Request, res: Response) => {
        const user: User = req.body
        user.id = req.user!.id
        const err = this.validator.validateGeneral(user)
        if (err) {
            throw new ValidationError(err)
        }
        return this.userProvider.updateGeneral(user).then((r) => {
            return res.json({
                status: 'OK',
                results: [r],
            })
        })
    }

    // Загрузка аватарки
    updateAvatar = async (req: Request, res: Response) => {
        if (!req.files || Object.keys(req.files).length === 0) {
            throw new FileError('Аватарка не прикреплена')
        }
        const err = this.validator.validateImg(req.files.avatar as UploadedFile)
        if (err) {
            throw new ValidationError(err)
        }
        return this.userProvider.updateAvatar(req.user!.id, req.files.avatar).then(() => {
            return res.json({
                status: 'OK',
            })
        })
    }
}

export default UserController
