import {Request, Response} from 'express'
import {CommentForum, Forum} from '../common/entity/types'
import Validator from '../common/validator'
import {ForumUpload} from '../entity/types'
import {UploadedFile} from 'express-fileupload'
import ForumProvider from '../providers/forum'
import Controller from '../core/controller'
import RightProvider from '../providers/right'
import AuthProvider from '../providers/auth'
import TokenStorage from '../services/token'
import {FORBIDDEN} from '../errors'

class ForumController extends Controller {
    constructor(
        rightProvider: RightProvider,
        authProvider: AuthProvider,
        private forumProvider: ForumProvider,
        private validator: Validator
    ) {
        super(rightProvider, authProvider)
    }

    // Создать форум
    create = async (req: Request, res: Response) => {
        if (!req.files || Object.keys(req.files).length < 1 || !req.files.fileAvatar) {
            return res.json({
                status: 'INVALID_FILE',
                errorMessage: 'Аватарка форума не прикреплена',
            })
        }
        const c: ForumUpload = req.body
        c.fileAvatar = req.files.fileAvatar as UploadedFile
        let err = this.validator.validateForum(c)
        err += this.validator.validateImg(c.fileAvatar)
        if (!!err) {
            return res.json({
                status: 'INVALID_DATA',
                errorMessage: err,
            })
        }
        c.idUser = req.user!.id
        return this.forumProvider.create(c).then((r: any) => {
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

    // Получить форум по id
    getById = async (req: Request, res: Response) => {
        const id = parseInt(req.params.id)
        if (isNaN(id)) {
            return res.json({
                status: 'INVALID_PARSE',
                errorMessage: 'Ошибка парсинга id',
            })
        }
        return this.forumProvider.getById(id).then(async ([story, comments]) => {
            if (story.closed) {
                const user = await this.authProvider.getUser(TokenStorage.getToken(req))
                if (!user || user && user.id !== story.idUser) {
                    return res.json(FORBIDDEN)
                }
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

    // Получить все форумы
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
        return this.forumProvider.getAll(limit, page, data).then((r: any) => {
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

    // Редактировать форум
    update = async (req: Request, res: Response) => {
        const id = parseInt(req.params.id)
        if (isNaN(id)) {
            return res.json({
                status: 'INVALID_PARSE',
                errorMessage: 'Ошибка парсинга id',
            })
        }
        const c: ForumUpload = req.body
        c.id = id
        let err = this.validator.validateForum(c)

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
        c.idUser = req.user!.id
        return this.forumProvider.update(c).then((r: any) => {
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

    // Удалить форум
    remove = async (req: Request, res: Response) => {
        const c = new Forum()
        c.id = parseInt(req.params.id)
        if (isNaN(c.id)) {
            return res.json({
                status: 'INVALID_PARSE',
                errorMessage: 'Ошибка парсинга id',
            })
        }
        c.idUser = req.user!.id
        return this.forumProvider.remove(c).then(() => {
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
        const c: CommentForum = req.body
        c.idUser = req.user!.id
        const err = this.validator.validateComment(c)
        if (err) {
            return res.json({
                status: 'INVALID_DATA',
                errorMessage: err,
            })
        }
        return this.forumProvider.createComment(c).then((r: number) => {
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
        return this.forumProvider.getComments(id).then((r) => {
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
        const c = new CommentForum()
        c.id = parseInt(req.params.idComment)
        if (isNaN(c.id)) {
            return res.json({
                status: 'INVALID_PARSE',
                errorMessage: 'Ошибка парсинга id',
            })
        }
        c.idUser = req.user!.id
        this.forumProvider.removeComment(c).then(() => {
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

export default ForumController
