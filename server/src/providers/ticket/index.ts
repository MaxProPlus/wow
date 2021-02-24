import TicketRepository from '../../repositories/ticket'
import {
  CommentTicket,
  Ticket,
  TicketStatus,
  TicketType,
} from '../../common/entity/types'
import {defaultAvatar} from '../../entity/types'
import RightProvider from '../right'
import {ApiError, ForbiddenError} from '../../errors'

class TicketProvider {
  constructor(
    private repository: TicketRepository,
    private rightProvider: RightProvider
  ) {}

  // Создать тикет
  create = (ticket: Ticket): Promise<number> => {
    return this.repository.insert(ticket)
  }

  // Получить тикет по id
  getById = async (idTicket: number): Promise<[Ticket, CommentTicket[]]> => {
    const ticket = await this.repository.selectById(idTicket)
    const comments = await this.repository.selectCommentsByIdTicket(idTicket)
    comments.forEach((c: CommentTicket) => {
      if (!c.authorUrlAvatar) {
        c.authorUrlAvatar = defaultAvatar
      }
    })
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
  createComment = async (comment: CommentTicket): Promise<number> => {
    const ticket = await this.repository.selectById(comment.idTicket)
    if (ticket.status === TicketStatus.CLOSE) {
      throw new ApiError('Тикет закрыт', 'TICKET_ERROR')
    }
    const right = await this.rightProvider.ticketModerator(comment.idUser)
    if (ticket.idUser !== comment.idUser && !right) {
      throw new ForbiddenError()
    }
    return this.repository.insertComment(comment)
  }

  // Получить комментарии к тикету
  getComments = async (
    idTicket: number,
    idUser: number
  ): Promise<CommentTicket[]> => {
    const data = await this.getById(idTicket)
    if (
      data[0].idUser !== idUser &&
      !(await this.rightProvider.ticketModerator(idUser))
    ) {
      throw new ForbiddenError()
    }
    const comments = await this.repository.selectCommentsByIdTicket(idTicket)
    comments.forEach((c: CommentTicket) => {
      if (!c.authorUrlAvatar) {
        c.authorUrlAvatar = defaultAvatar
      }
    })
    return comments
  }
}

export default TicketProvider
