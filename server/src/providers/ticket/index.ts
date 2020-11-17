import TicketRepository from '../../repositories/ticket'
import {CommentTicket, Ticket, TicketStatus} from '../../common/entity/types'
import {defaultAvatar} from '../../entity/types'

class TicketProvider {
    private repository: TicketRepository

    constructor(connection: any) {
        this.repository = new TicketRepository(connection.getPoolPromise())
    }

    // Создать тикет
    create = async (ticket: Ticket) => {
        return this.repository.insert(ticket)
    }

    // Получить тикет по id
    getById = (idTicket: number): Promise<[Ticket, CommentTicket[]]> => {
        const p = []
        p.push(this.repository.selectById(idTicket))
        p.push(this.getComments(idTicket))
        return Promise.all(p) as Promise<[Ticket, CommentTicket[]]>
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

    changeStatus = (idTicket: number, status: TicketStatus) => {
        return this.repository.updateStatus(idTicket, status)
    }

    // Создать комментарий на тикет
    createComment = async (comment: CommentTicket) => {
        return this.repository.insertComment(comment)
    }

    // Получить комментарии к тикету
    getComments = async (idTicket: number) => {
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