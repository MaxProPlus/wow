import {Express, Request, Response} from 'express'
import Auth from '../services/auth'
import {Article, CommentArticle} from '../common/entity/types'
import Validator from '../common/validator'
import RightModel from '../models/right/model'
import ArticleModel from '../models/article/model'
import {ArticleUpload} from '../entity/types'
import {UploadedFile} from 'express-fileupload'
import TokenStorage from '../services/token'

class ArticleController {
    private articleModel: ArticleModel
    private rightModel: RightModel
    private auth: Auth
    private validator = new Validator()

    constructor(app: Express) {
        const db = app.get('db')
        this.articleModel = new ArticleModel(db)
        this.rightModel = new RightModel(db)
        this.auth = new Auth(db)
    }

    // Создать новость
    create = async (req: Request, res: Response) => {
        if (!req.files || Object.keys(req.files).length < 1 || !req.files.fileAvatar) {
            return res.json({
                status: 'INVALID_FILE',
                errorMessage: 'Не прикрепленна аватарка новости',
            })
        }
        const c: ArticleUpload = req.body
        c.fileAvatar = req.files.fileAvatar as UploadedFile
        let err = this.validator.validateArticle(c)
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
                errorMessage: err,
            })
        }

        // Проверка прав на управление новостью
        if (!(await this.rightModel.articleCrud(c.idUser))) {
            return res.json({
                status: 'ERROR_RIGHT',
                errorMessage: 'Нет прав',
            })
        }
        return this.articleModel.create(c).then((r: any) => {
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

    // Получить новость по id
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
        return this.articleModel.getById(id).then(([article, comments]) => {
            if (!!article.closed && idUser !== article.idUser) {
                return res.json({
                    status: 'ERROR_RIGHT',
                    errorMessage: 'Нет прав для просмотра',
                })
            }
            return res.json({
                status: 'OK',
                results: [article, comments],
            })
        }, (err: string) => {
            return res.json({
                status: 'ERROR',
                errorMessage: err,
            })
        })
    }

    // Получить все новости
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
        return this.articleModel.getAll(limit, page, data).then((r: any) => {
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

    // Редактировать новость
    update = async (req: Request, res: Response) => {
        const id = parseInt(req.params.id)
        if (isNaN(id)) {
            return res.json({
                status: 'INVALID_PARSE',
                errorMessage: 'Ошибка парсинга id',
            })
        }
        const c: ArticleUpload = req.body
        c.id = id
        let err = this.validator.validateArticle(c)

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

        // Проверка прав на управление новостью
        if (!(await this.rightModel.articleCrud(c.idUser))) {
            return res.json({
                status: 'ERROR_RIGHT',
                errorMessage: 'Нет прав',
            })
        }
        return this.articleModel.update(c).then((r: any) => {
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
        const c = new Article()
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

        // Проверка прав на управление новостью
        if (!(await this.rightModel.articleCrud(c.idUser))) {
            return res.json({
                status: 'ERROR_RIGHT',
                errorMessage: 'Нет прав',
            })
        }
        return this.articleModel.remove(c).then(() => {
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
        const c: CommentArticle = req.body
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
        return this.articleModel.createComment(c).then((r: number) => {
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
        const idArticle = parseInt(req.params.idArticle)
        if (isNaN(idArticle)) {
            return res.json({
                status: 'INVALID_PARSE',
                errorMessage: 'Ошибка парсинга id',
            })
        }
        return this.articleModel.getComments(idArticle).then((r) => {
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

export default ArticleController
