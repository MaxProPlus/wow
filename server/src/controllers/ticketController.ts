import {Express, Request, Response} from 'express'
import {CommentTicket, Ticket, TicketType, User} from '../common/entity/types'
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
        c.idUser = req.userId!
        const err = this.validator.validateTicket(c)
        if (err) {
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

    // Получить тикет по id
    getById = async (req: Request, res: Response) => {
        const idTicket = parseInt(req.params.id)
        if (isNaN(idTicket)) {
            return res.json({
                status: 'INVALID_PARSE',
                errorMessage: 'Ошибка парсинга id',
            })
        }
        const idUser = req.userId!
        const ticketModerator = await this.rightProvider.ticketModerator(idUser)
        return this.ticketProvider.getById(idTicket).then(([ticket, comments]) => {
            if (ticket.idUser !== idUser && !ticketModerator) {
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
        const idUser = req.userId!
        const ticketModerator = await this.rightProvider.ticketModerator(idUser)
        if (!ticketModerator) {
            return res.json({
                status: 'ERROR_RIGHT',
                errorMessage: 'Нет прав для редактирование статуса',
            })
        }
        const err = this.validator.validateTicketStatus(req.body.status)
        if (err) {
            return res.json({
                status: 'ERROR',
                errorMessage: 'Ошибка валидации',
            })
        }
        return this.ticketProvider.changeStatus(idTicket, req.body.status, idUser).then(() => {
            return res.json({
                status: 'OK',
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

    // Создать комментарий на тикет
    createComment = async (req: Request, res: Response) => {
        const c: CommentTicket = req.body
        c.idUser = req.userId!
        const err = this.validator.validateComment(c)
        if (err) {
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

    // Получить комментарий к тикету по id
    getComments = async (req: Request, res: Response) => {
        const idTicket = parseInt(req.params.idTicket)
        if (isNaN(idTicket)) {
            return res.json({
                status: 'INVALID_PARSE',
                errorMessage: 'Ошибка парсинга id',
            })
        }
        const idUser = req.userId!
        return this.ticketProvider.getComments(idTicket, idUser).then((r) => {
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
