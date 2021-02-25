import {Request, Response} from 'express'
import {CommentTicket, Ticket} from '../common/entity/types'
import Validator from '../common/validator'
import TicketProvider from '../providers/ticket'
import {Rights} from '../providers/right'
import {ForbiddenError, ParseError, ValidationError} from '../errors'

class TicketController {
  constructor(
    private ticketProvider: TicketProvider,
    private validator: Validator
  ) {}

  // Создать тикет
  create = async (req: Request, res: Response) => {
    const c: Ticket = req.body
    c.idUser = req.user!.id
    const err = this.validator.validateTicket(c)
    if (err) {
      throw new ValidationError(err)
    }
    return this.ticketProvider.create(c).then((r) => {
      return res.json({
        status: 'OK',
        results: [r],
      })
    })
  }

  // Получить тикет по id
  getById = async (req: Request, res: Response) => {
    const idTicket = parseInt(req.params.id)
    if (isNaN(idTicket)) {
      throw new ParseError()
    }
    const idUser = req.user!.id
    const ticketModerator = req.user!.rights.includes(Rights.TICKET_MODERATOR)
    return this.ticketProvider.getById(idTicket).then(([ticket, comments]) => {
      if (ticket.idUser !== idUser && !ticketModerator) {
        throw new ForbiddenError()
      }
      return res.json({
        status: 'OK',
        results: [ticket, comments],
      })
    })
  }

  changeStatus = async (req: Request, res: Response) => {
    const idTicket = parseInt(req.params.id)
    if (isNaN(idTicket)) {
      throw new ParseError()
    }
    const idUser = req.user!.id
    if (!req.user!.rights.includes(Rights.TICKET_MODERATOR)) {
      throw new ForbiddenError()
    }
    const err = this.validator.validateTicketStatus(req.body.status)
    if (err) {
      throw new ValidationError(err)
    }
    return this.ticketProvider
      .changeStatus(idTicket, req.body.status, idUser)
      .then(() => {
        return res.json({
          status: 'OK',
        })
      })
  }

  // Получить все типы тикетов
  getTypesOfTicket = async (req: Request, res: Response) => {
    return this.ticketProvider.getTypesOfTicket().then((r) => {
      return res.json({
        status: 'OK',
        results: r,
      })
    })
  }

  // Получить все тикеты по id типу
  getTicketsByType = async (req: Request, res: Response) => {
    const idTicketType = parseInt(req.params.id)
    const limit = parseInt(req.query.limit as string) || 10
    const page = parseInt(req.query.page as string) || 1
    if (isNaN(idTicketType)) {
      throw new ParseError()
    }
    return this.ticketProvider
      .getTicketsByType(idTicketType, limit, page)
      .then((r) => {
        return res.json({
          status: 'OK',
          results: r,
        })
      })
  }

  // Создать комментарий на тикет
  createComment = async (req: Request, res: Response) => {
    const c: CommentTicket = req.body
    c.idUser = req.user!.id
    const err = this.validator.validateComment(c)
    if (err) {
      throw new ValidationError(err)
    }
    return this.ticketProvider
      .createComment(c, req.user!.rights.includes(Rights.TICKET_MODERATOR))
      .then((r) => {
        return res.json({
          status: 'OK',
          results: [r],
        })
      })
  }

  // Получить комментарий к тикету по id
  getComments = async (req: Request, res: Response) => {
    const idTicket = parseInt(req.params.idTicket)
    if (isNaN(idTicket)) {
      throw new ParseError()
    }
    const idUser = req.user!.id
    return this.ticketProvider
      .getComments(
        idTicket,
        idUser,
        req.user!.rights.includes(Rights.TICKET_MODERATOR)
      )
      .then((r) => {
        return res.json({
          status: 'OK',
          results: r,
        })
      })
  }
}

export default TicketController
