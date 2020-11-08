import {Express, Request, Response} from 'express'
import Auth from '../services/auth'
import {CommentGuild, Guild} from '../common/entity/types'
import Validator from '../common/validator'
import RightModel from '../models/right/model'
import {GuildUpload} from '../entity/types'
import {UploadedFile} from 'express-fileupload'
import GuildModel from '../models/guild/model'
import TokenStorage from '../services/token'

class GuildController {
    private guildModel: GuildModel
    private rightModel: RightModel
    private auth: Auth
    private validator = new Validator()

    constructor(app: Express) {
        const db = app.get('db')
        this.guildModel = new GuildModel(db)
        this.rightModel = new RightModel(db)
        this.auth = new Auth(db)
    }

    // Создать гильдию
    create = async (req: Request, res: Response) => {
        if (!req.files || Object.keys(req.files).length < 1 || !req.files.fileAvatar) {
            return res.json({
                status: 'INVALID_FILE',
                errorMessage: 'Аватарка гильдии не прикреплена',
            })
        }
        const c: GuildUpload = req.body
        c.fileAvatar = req.files.fileAvatar as UploadedFile
        let err = this.validator.validateGuild(c)
        err += this.validator.validateImg(c.fileAvatar)
        if (!!err) {
            return res.json({
                status: 'INVALID_DATA',
                errorMessage: err,
            })
        }
        try {
            c.idUser = await this.auth.checkAuth(TokenStorage.getToken(req))
        } catch (err) {
            return res.json({
                status: 'INVALID_AUTH',
                errorMessage: 'Ошибка авторизации',
            })
        }
        return this.guildModel.create(c).then((r: any) => {
            return res.json({
                status: 'OK',
                results: [r],
            })
        }, (err: string) => {
            return res.json({
                status: 'ERROR',
                errorMessage: err,
            })
        })
    }

    // Получить гильдию по id
    getById = async (req: Request, res: Response) => {
        const id = parseInt(req.params.id)
        if (isNaN(id)) {
            return res.json({
                status: 'INVALID_PARSE',
                errorMessage: 'Ошибка парсинга id',
            })
        }
        let idUser = 0
        try {
            idUser = await this.auth.checkAuth(TokenStorage.getToken(req))
        } catch (err) {
        }
        return this.guildModel.getById(id).then(([guild, comments]) => {
            if (!!guild.closed && idUser !== guild.idUser) {
                return res.json({
                    status: 'ERROR_RIGHT',
                    errorMessage: 'Нет прав для просмотра',
                })
            }
            return res.json({
                status: 'OK',
                results: [guild, comments],
            })
        }, (err: string) => {
            return res.json({
                status: 'ERROR',
                errorMessage: err,
            })
        })
    }

    // Получить все гильдии
    getAll = async (req: Request, res: Response) => {
        const limit = parseInt(req.query.limit as string) || 10
        const page = parseInt(req.query.page as string) || 1
        const data: any = {}
        if (!!req.query.title) {
            data.title = req.query.title
        }
        return this.guildModel.getAll(limit, page, data).then((r: any) => {
            return res.json({
                status: 'OK',
                results: r,
            })
        }, (err: string) => {
            return res.json({
                status: 'ERROR',
                errorMessage: err,
            })
        })
    }

    // Редактировать гильдию
    update = async (req: Request, res: Response) => {
        const id = parseInt(req.params.id)
        if (isNaN(id)) {
            return res.json({
                status: 'INVALID_PARSE',
                errorMessage: 'Ошибка парсинга id',
            })
        }
        const c: GuildUpload = req.body
        c.id = id
        let err = this.validator.validateGuild(c)

        if (!(!req.files || Object.keys(req.files).length < 1 || !req.files.fileAvatar)) {
            c.fileAvatar = req.files.fileAvatar as UploadedFile
            err += this.validator.validateImg(c.fileAvatar)
        }
        if (!!err) {
            return res.json({
                status: 'INVALID_DATA',
                errorMessage: err,
            })
        }
        try {
            c.idUser = await this.auth.checkAuth(TokenStorage.getToken(req))
        } catch (err) {
            return res.json({
                status: 'INVALID_AUTH',
                errorMessage: 'Ошибка авторизации',
            })
        }
        return this.guildModel.update(c).then((r: any) => {
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

    // Удалить гильдию
    remove = async (req: Request, res: Response) => {
        const c = new Guild()
        c.id = parseInt(req.params.id)
        if (isNaN(c.id)) {
            return res.json({
                status: 'INVALID_PARSE',
                errorMessage: 'Ошибка парсинга id',
            })
        }
        try {
            c.idUser = await this.auth.checkAuth(TokenStorage.getToken(req))
        } catch (err) {
            return res.json({
                status: 'INVALID_AUTH',
                errorMessage: 'Ошибка авторизации',
            })
        }
        return this.guildModel.remove(c).then(() => {
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

    // Создать комментарий
    createComment = async (req: Request, res: Response) => {
        const c: CommentGuild = req.body
        try {
            c.idUser = await this.auth.checkAuth(TokenStorage.getToken(req))
            const {ok, err} = this.validator.validateComment(c)
            if (!ok) {
                return res.json({
                    status: 'INVALID_DATA',
                    errorMessage: err,
                })
            }
        } catch (err) {
            return res.json({
                status: 'INVALID_AUTH',
                errorMessage: 'Ошибка авторизации',
            })
        }
        return this.guildModel.createComment(c).then((r: number) => {
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

    // Получить комментарии
    getComments = async (req: Request, res: Response) => {
        const idCharacter = parseInt(req.params.idCharacter)
        if (isNaN(idCharacter)) {
            return res.json({
                status: 'INVALID_PARSE',
                errorMessage: 'Ошибка парсинга id',
            })
        }
        return this.guildModel.getComments(idCharacter).then((r) => {
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

    // Удалить комментарий
    removeComment = async (req: Request, res: Response) => {
    }
}

export default GuildController
