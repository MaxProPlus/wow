import {Express, Request, Response} from 'express'
import {CommentStory, Story} from '../common/entity/types'
import Validator from '../common/validator'
import {StoryUpload} from '../entity/types'
import {UploadedFile} from 'express-fileupload'
import StoryProvider from '../providers/story'
import Controller from '../core/controller'

class StoryController extends Controller {
    private storyProvider: StoryProvider
    private validator: Validator

    constructor(app: Express) {
        super(app)
        const db = app.get('db')
        this.storyProvider = new StoryProvider(db)
        this.validator = new Validator()
    }

    // Создать сюжет
    create = async (req: Request, res: Response) => {
        if (!req.files || Object.keys(req.files).length < 1 || !req.files.fileAvatar) {
            return res.json({
                status: 'INVALID_FILE',
                errorMessage: 'Аватарка сюжета не прикреплена',
            })
        }
        const c: StoryUpload = req.body
        c.fileAvatar = req.files.fileAvatar as UploadedFile
        let err = this.validator.validateStory(c)
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
        return this.storyProvider.create(c).then((r: any) => {
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

    // Получить сюжет по id
    getById = async (req: Request, res: Response) => {
        const id = parseInt(req.params.id)
        if (isNaN(id)) {
            return res.json({
                status: 'INVALID_PARSE',
                errorMessage: 'Ошибка парсинга id',
            })
        }
        const idUser = await this.getUserId(req)
        return this.storyProvider.getById(id).then(([story, comments]) => {
            if (!!story.closed && idUser !== story.idUser) {
                return res.json({
                    status: 'ERROR_RIGHT',
                    errorMessage: 'Нет прав для просмотра',
                })
            }
            return res.json({
                status: 'OK',
                results: [story, comments],
            })
        }, (err: string) => {
            return res.json({
                status: 'ERROR',
                errorMessage: err,
            })
        })
    }

    // Получить все сюжеты
    getAll = async (req: Request, res: Response) => {
        const limit = parseInt(req.query.limit as string) || 10
        const page = parseInt(req.query.page as string) || 1
        const data: any = {}
        if (!!req.query.title) {
            data.title = req.query.title
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
        return this.storyProvider.getAll(limit, page, data).then((r: any) => {
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

    // Редактировать сюжет
    update = async (req: Request, res: Response) => {
        const id = parseInt(req.params.id)
        if (isNaN(id)) {
            return res.json({
                status: 'INVALID_PARSE',
                errorMessage: 'Ошибка парсинга id',
            })
        }
        const c: StoryUpload = req.body
        c.id = id
        let err = this.validator.validateStory(c)

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
        return this.storyProvider.update(c).then((r: any) => {
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

    // Удалить сюжет
    remove = async (req: Request, res: Response) => {
        const c = new Story()
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
        return this.storyProvider.remove(c).then(() => {
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
        const c: CommentStory = req.body
        c.idUser = await this.getUserId(req)
        if (!c.idUser) {
            return res.json({
                status: 'INVALID_AUTH',
                errorMessage: 'Ошибка авторизации',
            })
        }
        const err = this.validator.validateComment(c)
        if (err) {
            return res.json({
                status: 'INVALID_DATA',
                errorMessage: err,
            })
        }
        return this.storyProvider.createComment(c).then((r: number) => {
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
        const id = parseInt(req.params.id)
        if (isNaN(id)) {
            return res.json({
                status: 'INVALID_PARSE',
                errorMessage: 'Ошибка парсинга id',
            })
        }
        return this.storyProvider.getComments(id).then((r) => {
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
        const c = new CommentStory()
        c.id = parseInt(req.params.idComment)
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
        this.storyProvider.removeComment(c).then(() => {
            return res.json({
                status: 'OK',
            })
        }, err => {
            return res.json({
                status: 'ERROR',
                errorMessage: err,
            })
        })
    }
}

export default StoryController
