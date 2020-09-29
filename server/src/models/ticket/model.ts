import Mapper from '../mappers/ticket'
import {CommentTicket, Ticket, TicketStatus} from '../../common/entity/types'
import {defaultAvatar} from '../../entity/types'

class TicketModel {
    private mapper: Mapper

    constructor(connection: any) {
        this.mapper = new Mapper(connection.getPoolPromise())
    }

    // Создать тикет
    create = async (ticket: Ticket) => {
        return this.mapper.insert(ticket)
    }

    // Получить тикет по id
    getById = (idTicket: number): Promise<[Ticket, CommentTicket[]]> => {
        const p = []
        p.push(this.mapper.selectById(idTicket))
        p.push(this.getComments(idTicket))
        return Promise.all(p) as Promise<[Ticket, CommentTicket[]]>
    }

    // Получить все типы тикетов
    getTypesOfTicket = async () => {
        return this.mapper.selectTypesOfTicket()
    }

    // Получить все тикеты по id типу
    getTicketsByType = async (idType: number, limit: number, page: number) => {
        const p = []
        p.push(this.mapper.selectTypeOfTicketById(idType))
        p.push(this.mapper.selectTicketsByType(idType, limit, page))
        p.push(this.mapper.selectCountTicketByType(idType))
        const r = await Promise.all(p)
        return {
            type: r[0],
            data: r[1],
            count: r[2],
        }
    }

    changeStatus = (idTicket: number, status: TicketStatus) => {
        return this.mapper.updateStatus(idTicket, status)
    }

    // Создать комментарий на тикет
    createComment = async (comment: CommentTicket) => {
        return this.mapper.insertComment(comment)
    }

    // Получить комментарии к тикету
    getComments = async (idTicket: number) => {
        const comments = await this.mapper.selectCommentsByIdTicket(idTicket)
        comments.forEach((c: CommentTicket) => {
            if (!c.authorUrlAvatar) {
                c.authorUrlAvatar = defaultAvatar
            }
        })
        return comments
    }
}

export default TicketModel