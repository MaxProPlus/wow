import Mapper from './mapper'
import {Comment, Ticket, TicketStatus} from '../../common/entity/types'
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

    // Создать комментарий на тикет
    createComment = async (comment: Comment) => {
        return this.mapper.insertComment(comment)
    }

    // Получить тикет по id
    getById = async (idTicket: number): Promise<[Ticket, Comment[]]> => {
        const p = []
        p.push(this.mapper.selectById(idTicket))
        p.push(this.getComments(idTicket))
        return Promise.all(p) as Promise<[Ticket, Comment[]]>
    }

    // Получить комментарии к тикету
    getComments = async (idTicket: number) => {
        const comments = await this.mapper.selectCommentsByIdTicket(idTicket)
        comments.forEach((c: Comment) => {
            if (!c.authorUrlAvatar) {
                c.authorUrlAvatar = defaultAvatar
            }
        })
        return comments
    }

    // Получить все типы тикетов
    getTicketTypes = async () => {
        return this.mapper.selectTicketTypes()
    }

    // Получить все тикеты по id типу
    getTicketsByType = async (idType: number) => {
        const p = []
        p.push(this.mapper.selectTicketTypeById(idType))
        p.push(this.mapper.selectTicketsByType(idType))
        return Promise.all(p)
    }

    changeStatus = (idTicket: number, status: TicketStatus) => {
        return this.mapper.updateStatus(idTicket, status)
    }
}

export default TicketModel