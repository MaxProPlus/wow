import {User, CommentTicket, Ticket, TicketStatus, TicketType} from '../../common/entity/types'
import logger from '../../services/logger'
import BasicMapper from './mapper'

class TicketMapper extends BasicMapper{

    // Создать тикет
    insert = (ticket: Ticket) => {
        const sql = `INSERT INTO ticket (title, text, id_ticket_type, id_user)
                     VALUES (?, ?, ?, ?)`
        return this.pool.query(sql, [ticket.title, ticket.text, ticket.idTicketType, ticket.idUser]).then(([r]: any) => {
            return Promise.resolve(r.insertId)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Создать комментарий на тикет
    insertComment = (comment: CommentTicket) => {
        const sql = `INSERT INTO ticket_comment (text, id_user, id_ticket)
                     VALUES (?, ?, ?)`
        return this.pool.query(sql, [comment.text, comment.idUser, comment.idTicket]).then(([r]: any) => {
            return Promise.resolve(r.insertId)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }


    // Получить количество тикетов
    selectCountTicketByType = (id: number): Promise<number> => {
        const sql = `select count(id) as count
        from ticket
        where id_ticket_type = ?`
        return this.pool.query(sql, [id]).then(([r]: any) => {
            if (!r.length) {
                return Promise.reject('Тикет не найден')
            }
            return Promise.resolve(r[0].count)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить тикет по id
    selectById = (id: number) => {
        const sql = `select t.id,
               t.title,
               t.id_ticket_type   as idTicketType,
               t.text,
               t.status,
               t.date_init        as dateInit,
               t.id_user       as idUser,
               t.id_user_moder as idUserModer,
               aUser.nickname     as userNickname,
               aModer.nickname    as moderNickname
        from ticket t
                 join account aUser on t.id_user = aUser.id
                 left join account aModer on t.id_user_moder = aModer.id
        where t.id = ?`
        return this.pool.query(sql, [id]).then(([r]: [User[]]) => {
            if (!r.length) {
                return Promise.reject('Тикет не найден')
            }
            return Promise.resolve(r[0])
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить тикет по id
    selectCommentsByIdTicket = (id: number) => {
        const sql = `select c.id,
               c.text,
               c.id_user as idUser,
               c.id_ticket  as idTicket,
               a.nickname   as authorNickname,
               a.url_avatar as authorUrlAvatar
        from comment c
                 join account a on c.id_user = a.id
        where c.id_ticket = ?`
        return this.pool.query(sql, [id]).then(([r]: [CommentTicket[]]) => {
            return Promise.resolve(r)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить тип тикета
    selectTypeOfTicketById = (idType: number) => {
        const sql = `select t.id, t.title, t.description, t.url_icon as urlIcon
            from ticket_type t
            where t.id = ?`
        return this.pool.query(sql, [idType]).then(([r]: [TicketType[]]) => {
            if (!r.length) {
                return Promise.reject('Категория заявок не найдена')
            }
            return Promise.resolve(r[0])
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить все типы тикетов
    selectTypesOfTicket = () => {
        const sql = `select t.id, t.title, t.description, t.url_icon as urlIcon
            from ticket_type t`
        return this.pool.query(sql).then(([r]: [TicketType[]]) => {
            if (!r.length) {
                return Promise.reject('Категории заявок не найдены')
            }
            return Promise.resolve(r)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить все тикеты по id типу
    selectTicketsByType = (id: number, limit: number, page: number) => {
        const sql = `select t.id, t.title, t.id_ticket_type as idTicketType, t.text, t.status, t.date_init as dateInit, t.id_user as idUser, t.id_user_moder as idUserModer 
            from ticket t 
            where t.id_ticket_type = ? limit ? offset ?`
        return this.pool.query(sql, [id, limit, limit * (page - 1)]).then(([r]: [Ticket[]]) => {
            return Promise.resolve(r)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    updateStatus = (idTicket: number, status: TicketStatus) => {
        const sql = `UPDATE ticket SET status=? where id = ?`
        return this.pool.query(sql, [status, idTicket]).then((r: any) => {
            if (!r[0].affectedRows) {
                return Promise.reject('Тикет не найден')
            }
            return Promise.resolve(idTicket)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }
}

export default TicketMapper
