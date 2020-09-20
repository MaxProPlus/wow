import {Request, Response} from 'express'
import Auth from '../services/auth'
import {CommentTicket, Ticket, TicketType} from '../common/entity/types'
import connection from '../services/mysql'
import Validator from '../common/validator'
import TicketModel from '../models/ticket/model'
import RightModel from '../models/right/model'

class TicketController {
    private ticketModel: TicketModel
    private rightModel: RightModel
    private auth: Auth
    private validator = new Validator()

    constructor() {
        this.ticketModel = new TicketModel(connection)
        this.rightModel = new RightModel(connection)
        this.auth = new Auth(connection)
    }

    // Создать тикет
    create = async (req: Request, res: Response) => {
        const c: Ticket = req.body
        try {
            c.idAccount = await this.auth.checkAuth(req.cookies.token)
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
        let idAccount = 0
        let flagTicketRead = false
        try {
            idAccount = await this.auth.checkAuth(req.cookies.token)
            flagTicketRead = await this.rightModel.ticketUpdateStatus(idAccount)
        } catch (err) {
            return res.json({
                status: 'INVALID_AUTH',
                errorMessage: err,
            })
        }
        return this.ticketModel.getById(idTicket).then(([ticket, comments]) => {
            if (ticket.idAccount !== idAccount && !flagTicketRead) {
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
        let idAccount = 0
        let flagTicketUpdateStatus = false
        try {
            idAccount = await this.auth.checkAuth(req.cookies.token)
            flagTicketUpdateStatus = await this.rightModel.ticketUpdateStatus(idAccount)
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
