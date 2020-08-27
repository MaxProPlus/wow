import {Request, Response} from 'express'
import Auth from '../services/auth'
import {Character, CommentCharacter} from '../common/entity/types'
import connection from '../services/mysql'
import Validator from '../common/validator'
import RightModel from '../models/right/model'
import CharacterModel from '../models/character/model'
import {CharacterUpload} from '../entity/types'
import {UploadedFile} from 'express-fileupload'

class CharacterController {
    private characterModel: CharacterModel
    private rightModel: RightModel
    private auth: Auth
    private validator = new Validator()

    constructor() {
        this.characterModel = new CharacterModel(connection)
        this.rightModel = new RightModel(connection)
        this.auth = new Auth(connection)
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
        try {
            c.idAccount = await this.auth.checkAuth(req.cookies.token)
        } catch (err) {
            return res.json({
                status: 'INVALID_AUTH',
                errorMessage: 'Ошибка авторизации',
            })
        }
        return this.characterModel.create(c).then((r: any) => {
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
        let idAccount = 0
        try {
            idAccount = await this.auth.checkAuth(req.cookies.token)
        } catch (err) {
        }
        return this.characterModel.getById(id).then(([character, comments]) => {
            if (!!character.closed && idAccount !== character.idAccount) {
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
        const query = req.query.query as string
        if (!query) {
            return this.characterModel.getAll(limit, page).then((r: any) => {
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
        return this.characterModel.getByQuery(query, limit, page).then((r: any) => {
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
        try {
            c.idAccount = await this.auth.checkAuth(req.cookies.token)
        } catch (err) {
            return res.json({
                status: 'INVALID_AUTH',
                errorMessage: 'Ошибка авторизации',
            })
        }
        return this.characterModel.update(c).then((r: any) => {
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
        try {
            c.idAccount = await this.auth.checkAuth(req.cookies.token)
        } catch (err) {
            return res.json({
                status: 'INVALID_AUTH',
                errorMessage: 'Ошибка авторизации',
            })
        }
        return this.characterModel.remove(c).then(()=>{
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
        try {
            c.idAccount = await this.auth.checkAuth(req.cookies.token)
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
        return this.characterModel.createComment(c).then((r: number) => {
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
        const idCharacter = parseInt(req.params.idCharacter)
        if (isNaN(idCharacter)) {
            return res.json({
                status: 'INVALID_PARSE',
                errorMessage: 'Ошибка парсинга id',
            })
        }
        return this.characterModel.getComments(idCharacter).then((r) => {
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
