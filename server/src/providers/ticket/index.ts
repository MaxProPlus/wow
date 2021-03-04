import TicketRepository from '../../repositories/ticket'
import {
  CommentTicket,
  Ticket,
  TicketStatus,
  TicketType,
} from '../../common/entity/types'
import {ApiError, Errors, ForbiddenError} from '../../errors'

class TicketProvider {
  constructor(private repository: TicketRepository) {}

  // Создать тикет
  create = (ticket: Ticket): Promise<number> => {
    return this.repository.insert(ticket)
  }

  // Получить тикет по id
  getById = async (idTicket: number): Promise<[Ticket, CommentTicket[]]> => {
    const ticket = await this.repository.selectById(idTicket)
    const comments = await this.repository.selectCommentsByIdTicket(idTicket)
    return [ticket, comments]
  }

  // Получить все типы тикетов
  getTypesOfTicket = (): Promise<TicketType[]> => {
    return this.repository.selectTypesOfTicket()
  }

  // Получить все тикеты по id типу
  getTicketsByType = async (
    idType: number,
    limit: number,
    page: number
  ): Promise<{type: TicketType; data: Ticket[]; count: number}> => {
    const p = []
    p.push(this.repository.selectTypeOfTicketById(idType))
    p.push(this.repository.selectTicketsByType(idType, limit, page))
    p.push(this.repository.selectCountTicketByType(idType))
    const r = await Promise.all<any>(p)
    return {
      type: r[0],
      data: r[1],
      count: r[2],
    }
  }

  changeStatus = async (
    idTicket: number,
    status: TicketStatus,
    idUser: number
  ): Promise<number> => {
    return this.repository.updateStatus(idTicket, status, idUser)
  }

  // Создать комментарий на тикет
  createComment = async (
    comment: CommentTicket,
    right: boolean
  ): Promise<number> => {
    const ticket = await this.repository.selectById(comment.idTicket)
    if (ticket.status === TicketStatus.CLOSE) {
      throw new ApiError('Тикет закрыт', Errors.ERROR_TICKET)
    }
    if (ticket.idUser !== comment.idUser && !right) {
      throw new ForbiddenError()
    }
    return this.repository.insertComment(comment)
  }

  // Получить комментарии к тикету
  getComments = async (
    idTicket: number,
    idUser: number,
    right: boolean
  ): Promise<CommentTicket[]> => {
    const data = await this.getById(idTicket)
    if (data[0].idUser !== idUser && !right) {
      throw new ForbiddenError()
    }
    return await this.repository.selectCommentsByIdTicket(idTicket)
  }
}

export default TicketProvider
