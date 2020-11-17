import {Express, Request, Response} from 'express'
import {CommentTicket, Ticket, TicketType} from '../common/entity/types'
import Validator from '../common/validator'
import TicketProvider from '../providers/ticket'
import Controller from '../core/controller'

class TicketController extends Controller {
    private ticketProvider: TicketProvider
    private validator: Validator

    constructor(app: Express) {
        super(app)
        const db = app.get('db')
        this.ticketProvider = new TicketProvider(db)
        this.validator = new Validator()
    }

    // Создать тикет
    create = async (req: Request, res: Response) => {
        const c: Ticket = req.body
        c.idUser = await this.getUserId(req)
        if (!c.idUser) {
            return res.json({
                status: 'INVALID_AUTH',
                errorMessage: 'Ошибка авторизации',
            })
        }
        const {ok, err} = this.validator.validateTicket(c)
        if (!ok) {
            return res.json({
                status: 'INVALID_DATA',
                errorMessage: err,
            })
        }
        return this.ticketProvider.create(c).then((r: any) => {
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
        return this.ticketProvider.createComment(c).then((r: any) => {
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
        const idUser = await this.getUserId(req)
        if (!idUser) {
            return res.json({
                status: 'INVALID_AUTH',
                errorMessage: 'Ошибка авторизации',
            })
        }
        const flagTicketRead = await this.rightProvider.ticketUpdateStatus(idUser)
        return this.ticketProvider.getById(idTicket).then(([ticket, comments]) => {
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
        const idUser = await this.getUserId(req)
        if (!idUser) {
            return res.json({
                status: 'INVALID_AUTH',
                errorMessage: 'Ошибка авторизации',
            })
        }
        const flagTicketUpdateStatus = await this.rightProvider.ticketUpdateStatus(idUser)
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
        return this.ticketProvider.changeStatus(idTicket, req.body.status).then((r: any) => {
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

    // Получить тикет по id
    getComments = async (req: Request, res: Response) => {
        const idTicket = parseInt(req.params.idTicket)
        if (isNaN(idTicket)) {
            return res.json({
                status: 'INVALID_PARSE',
                errorMessage: 'Ошибка парсинга id',
            })
        }
        return this.ticketProvider.getComments(idTicket).then((r) => {
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
        return this.ticketProvider.getTypesOfTicket().then((r: TicketType[]) => {
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
        return this.ticketProvider.getTicketsByType(idTicketType, limit, page).then((r: any) => {
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
