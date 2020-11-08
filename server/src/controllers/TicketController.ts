import {Express, Request, Response} from 'express'
import Auth from '../services/auth'
import {CommentTicket, Ticket, TicketType} from '../common/entity/types'
import Validator from '../common/validator'
import TicketModel from '../models/ticket/model'
import RightModel from '../models/right/model'
import TokenStorage from '../services/token'

class TicketController {
    private ticketModel: TicketModel
    private rightModel: RightModel
    private auth: Auth
    private validator = new Validator()

    constructor(app: Express) {
        const db = app.get('db')
        this.ticketModel = new TicketModel(db)
        this.rightModel = new RightModel(db)
        this.auth = new Auth(db)
    }

    // Создать тикет
    create = async (req: Request, res: Response) => {
        const c: Ticket = req.body
        try {
            c.idUser = await this.auth.checkAuth(TokenStorage.getToken(req))
            const {ok, err} = this.validator.validateTicket(c)
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
        return this.ticketModel.create(c).then((r: any) => {
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

    // Создать комментарий на тикет
    createComment = async (req: Request, res: Response) => {
        const c: CommentTicket = req.body
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
        return this.ticketModel.createComment(c).then((r: any) => {
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

    // Получить тикет по id
    getById = async (req: Request, res: Response) => {
        const idTicket = parseInt(req.params.id)
        if (isNaN(idTicket)) {
            return res.json({
                status: 'INVALID_PARSE',
                errorMessage: 'Ошибка парсинга id',
            })
        }
        let idUser = 0
        let flagTicketRead = false
        try {
            idUser = await this.auth.checkAuth(TokenStorage.getToken(req))
            flagTicketRead = await this.rightModel.ticketUpdateStatus(idUser)
        } catch (err) {
            return res.json({
                status: 'INVALID_AUTH',
                errorMessage: err,
            })
        }
        return this.ticketModel.getById(idTicket).then(([ticket, comments]) => {
            if (ticket.idUser !== idUser && !flagTicketRead) {
                return res.json({
                    status: 'ERROR_RIGHT',
                    errorMessage: 'Нет прав для просмотра',
                })
            }
            return res.json({
                status: 'OK',
                results: [ticket, comments],
            })
        }, (err: any) => {
            return res.json({
                status: 'ERROR',
                errorMessage: err,
            })
        })
    }

    changeStatus = async (req: Request, res: Response) => {
        const idTicket = parseInt(req.params.id)
        if (isNaN(idTicket)) {
            return res.json({
                status: 'INVALID_PARSE',
                errorMessage: 'Ошибка парсинга id',
            })
        }
        let idUser = 0
        let flagTicketUpdateStatus = false
        try {
            idUser = await this.auth.checkAuth(TokenStorage.getToken(req))
            flagTicketUpdateStatus = await this.rightModel.ticketUpdateStatus(idUser)
        } catch (err) {
            return res.json({
                status: 'INVALID_AUTH',
                errorMessage: err,
            })
        }
        if (!flagTicketUpdateStatus) {
            return res.json({
                status: 'ERROR_RIGHT',
                errorMessage: 'Нет прав для редактирование статуса',
            })
        }
        // todo
        if (req.body.status !== 0 && req.body.status !== 1 && req.body.status !== 9) {
            return res.json({
                status: 'ERROR',
                errorMessage: 'Ошибка валидации',
            })

        }
        return this.ticketModel.changeStatus(idTicket, req.body.status).then((r: any) => {
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

    // Получить тикет по id
    getComments = async (req: Request, res: Response) => {
        const idTicket = parseInt(req.params.idTicket)
        if (isNaN(idTicket)) {
            return res.json({
                status: 'INVALID_PARSE',
                errorMessage: 'Ошибка парсинга id',
            })
        }
        return this.ticketModel.getComments(idTicket).then((r) => {
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

    // Получить все типы тикетов
    getTypesOfTicket = async (req: Request, res: Response) => {
        return this.ticketModel.getTypesOfTicket().then((r: TicketType[]) => {
            return res.json({
                status: 'OK',
                results: r,
            })
        }, (err) => {
            return res.json({
                status: 'ERROR',
                errorMessage: err,
            })
        })
    }

    // Получить все тикеты по id типу
    getTicketsByType = async (req: Request, res: Response) => {
        const idTicketType = parseInt(req.params.id)
        const limit = parseInt(req.query.limit as string) || 10
        const page = parseInt(req.query.page as string) || 1
        if (isNaN(idTicketType)) {
            return res.json({
                status: 'INVALID_PARSE',
                errorMessage: 'Ошибка парсинга id',
            })
        }
        return this.ticketModel.getTicketsByType(idTicketType, limit, page).then((r: any) => {
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
}

export default TicketController
