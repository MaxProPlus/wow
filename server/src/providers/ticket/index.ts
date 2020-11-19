import TicketRepository from '../../repositories/ticket'
import {CommentTicket, Ticket, TicketStatus} from '../../common/entity/types'
import {defaultAvatar} from '../../entity/types'
import RightProvider from '../right'

class TicketProvider {
    private repository: TicketRepository
    private rightProvider: RightProvider

    constructor(connection: any) {
        this.repository = new TicketRepository(connection.getPoolPromise())
        this.rightProvider = new RightProvider(connection)
    }

    // Создать тикет
    create = async (ticket: Ticket) => {
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
    getTypesOfTicket = async () => {
        return this.repository.selectTypesOfTicket()
    }

    // Получить все тикеты по id типу
    getTicketsByType = async (idType: number, limit: number, page: number) => {
        const p = []
        p.push(this.repository.selectTypeOfTicketById(idType))
        p.push(this.repository.selectTicketsByType(idType, limit, page))
        p.push(this.repository.selectCountTicketByType(idType))
        const r = await Promise.all(p)
        return {
            type: r[0],
            data: r[1],
            count: r[2],
        }
    }

    changeStatus = async (idTicket: number, status: TicketStatus, idUser: number) => {
        return this.repository.updateStatus(idTicket, status, idUser)
    }

    // Создать комментарий на тикет
    createComment = async (comment: CommentTicket) => {
        const ticket = await this.repository.selectById(comment.idTicket)
        if (ticket.status === TicketStatus.CLOSE) {
            return Promise.reject('Тикет закрыт')
        }
        const right = await this.rightProvider.ticketModerator(comment.idUser)
        if (ticket.idUser !== comment.idUser && !right) {
            return Promise.reject('Нет прав')
        }
        return this.repository.insertComment(comment)
    }

    // Получить комментарии к тикету
    getComments = async (idTicket: number, idUser: number) => {
        const data = await this.getById(idTicket)
        if (data[0].idUser !== idUser && !await this.rightProvider.ticketModerator(idUser)) {
            return Promise.reject('Нет прав')
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