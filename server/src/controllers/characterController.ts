import {Express, Request, Response} from 'express'
import {Character, CommentCharacter} from '../common/entity/types'
import Validator from '../common/validator'
import CharacterProvider from '../providers/character'
import {CharacterUpload} from '../entity/types'
import {UploadedFile} from 'express-fileupload'
import Controller from '../core/controller'

class CharacterController extends Controller {
    private characterProvider: CharacterProvider
    private validator: Validator

    constructor(app: Express) {
        super(app)
        const db = app.get('db')
        this.characterProvider = new CharacterProvider(db)
        this.validator = new Validator()
    }

    // Создать персонажа
    create = async (req: Request, res: Response) => {
        if (!req.files || Object.keys(req.files).length < 1 || !req.files.fileAvatar) {
            return res.json({
                status: 'INVALID_FILE',
                errorMessage: 'Не прикрепленна аватарка персонажа',
            })
        }
        const c: CharacterUpload = req.body
        c.fileAvatar = req.files.fileAvatar as UploadedFile
        let err = this.validator.validateCharacter(c)
        err += this.validator.validateImg(c.fileAvatar)
        if (!!err) {
            return res.json({
                status: 'INVALID_DATA',
                errorMessage: err,
            })
        }
        c.idUser = await this.getUserId(req)
        if (!c.idUser) {
            return res.json({
                status: 'INVALID_AUTH',
                errorMessage: 'Ошибка авторизации',
            })
        }
        return this.characterProvider.create(c).then((r: any) => {
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

    // Получить персонажа по id
    getById = async (req: Request, res: Response) => {
        const id = parseInt(req.params.id)
        if (isNaN(id)) {
            return res.json({
                status: 'INVALID_PARSE',
                errorMessage: 'Ошибка парсинга id',
            })
        }
        const idUser = await this.getUserId(req)
        return this.characterProvider.getById(id).then(([character, comments]) => {
            if (!!character.closed && idUser !== character.idUser) {
                return res.json({
                    status: 'ERROR_RIGHT',
                    errorMessage: 'Нет прав для просмотра',
                })
            }
            return res.json({
                status: 'OK',
                results: [character, comments],
            })
        }, (err: string) => {
            return res.json({
                status: 'ERROR',
                errorMessage: err,
            })
        })
    }

    // Получить всех персонажей
    getAll = async (req: Request, res: Response) => {
        const limit = parseInt(req.query.limit as string) || 10
        const page = parseInt(req.query.page as string) || 1
        const data: any = {}
        if (!!req.query.title) {
            data.title = req.query.title
        }
        if (!!req.query.nickname) {
            data.nickname = req.query.nickname
        }
        if (!!req.query.race) {
            data.race = req.query.race
        }
        if (!!req.query.sex) {
            data.sex = parseInt(req.query.sex as string)
        }
        if (!!req.query.active) {
            data.active = parseInt(req.query.active as string)
        }
        // Если hidden = 1, то поиск по всем материалам
        // Если hidden = 0, то поиск только по не скрытым материалам
        if (!!req.query.hidden) {
            data.hidden = parseInt(req.query.hidden as string)
        } else {
            data.hidden = 0
        }
        if (data.hidden) {
            delete data.hidden
        }
        return this.characterProvider.getAll(limit, page, data).then((r: any) => {
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

    // Редактировать персонажа
    update = async (req: Request, res: Response) => {
        const id = parseInt(req.params.id)
        if (isNaN(id)) {
            return res.json({
                status: 'INVALID_PARSE',
                errorMessage: 'Ошибка парсинга id',
            })
        }
        const c: CharacterUpload = req.body
        c.id = id
        let err = this.validator.validateCharacter(c)

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
        c.idUser = await this.getUserId(req)
        if (!c.idUser) {
            return res.json({
                status: 'INVALID_AUTH',
                errorMessage: 'Ошибка авторизации',
            })
        }
        return this.characterProvider.update(c).then((r: any) => {
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

    // Удалить персонажа
    remove = async (req: Request, res: Response) => {
        const c = new Character()
        c.id = parseInt(req.params.id)
        if (isNaN(c.id)) {
            return res.json({
                status: 'INVALID_PARSE',
                errorMessage: 'Ошибка парсинга id',
            })
        }
        c.idUser = await this.getUserId(req)
        if (!c.idUser) {
            return res.json({
                status: 'INVALID_AUTH',
                errorMessage: 'Ошибка авторизации',
            })
        }
        return this.characterProvider.remove(c).then(() => {
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

    // Создать комментарий к персонажу
    createComment = async (req: Request, res: Response) => {
        const c: CommentCharacter = req.body
        c.idUser = await this.getUserId(req)
        if (!c.idUser) {
            return res.json({
                status: 'INVALID_AUTH',
                errorMessage: 'Ошибка авторизации',
            })
        }
        const {ok, err} = this.validator.validateComment(c)
        if (!ok) {
            return res.json({
                status: 'INVALID_DATA',
                errorMessage: err,
            })
        }
        return this.characterProvider.createComment(c).then((r: number) => {
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

    // Получить комментарии к персонажу
    getComments = async (req: Request, res: Response) => {
        const id = parseInt(req.params.id)
        if (isNaN(id)) {
            return res.json({
                status: 'INVALID_PARSE',
                errorMessage: 'Ошибка парсинга id',
            })
        }
        return this.characterProvider.getComments(id).then((r) => {
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

export default CharacterController
