import {
  CommentTicket,
  Ticket,
  TicketStatus,
  TicketType,
} from '../common/entity/types'
import Repository from '../core/repository'
import {DBError, NotFoundError} from '../errors'
import {logger} from '../modules/core'
import {MysqlError, OkPacket} from 'mysql'

class TicketRepository extends Repository {
  // Создать тикет
  insert = (ticket: Ticket): Promise<number> => {
    const sql = `INSERT INTO ticket (title, text, id_ticket_type, id_user)
                     VALUES (?, ?, ?, ?)`
    return this.pool
      .query(sql, [
        ticket.title,
        ticket.text,
        ticket.idTicketType,
        ticket.idUser,
      ])
      .then(
        ([r]: [OkPacket]) => {
          return r.insertId
        },
        (err: MysqlError) => {
          logger.error('Ошибка запроса к бд: ', err)
          throw new DBError()
        }
      )
  }

  // Получить количество тикетов
  selectCountTicketByType = (id: number): Promise<number> => {
    const sql = `select count(id) as count
                     from ticket
                     where id_ticket_type = ?`
    return this.pool.query(sql, [id]).then(
      ([r]: any) => {
        if (!r.length) {
          throw new NotFoundError('Тикет не найден')
        }
        return r[0].count
      },
      (err: MysqlError) => {
        logger.error('Ошибка запроса к бд: ', err)
        throw new DBError()
      }
    )
  }

  // Получить тикет по id
  selectById = (id: number): Promise<Ticket> => {
    const sql = `select t.id,
                            t.title,
                            t.id_ticket_type as idTicketType,
                            t.text,
                            t.status,
                            t.updated_at     as updatedAt,
                            t.created_at     as createdAt,
                            t.id_user        as idUser,
                            t.id_user_moder  as idUserModer,
                            user.nickname    as userNickname,
                            moder.nickname   as moderNickname
                     from ticket t
                              join user on t.id_user = user.id
                              left join user moder on t.id_user_moder = moder.id
                     where t.id = ?`
    return this.pool.query(sql, [id]).then(
      ([r]: [Ticket[]]) => {
        if (!r.length) {
          throw new NotFoundError('Тикет не найден')
        }
        return r[0]
      },
      (err: MysqlError) => {
        logger.error('Ошибка запроса к бд: ', err)
        throw new DBError()
      }
    )
  }

  // Получить тип тикета по id
  selectTypeOfTicketById = (idType: number): Promise<TicketType> => {
    const sql = `select t.id,
                            t.title,
                            t.description,
                            t.url_avatar as urlAvatar
                     from ticket_type t
                     where t.id = ?`
    return this.pool.query(sql, [idType]).then(
      ([r]: [TicketType[]]) => {
        if (!r.length) {
          throw new NotFoundError('Категория заявок не найдена')
        }
        return r[0]
      },
      (err: MysqlError) => {
        logger.error('Ошибка запроса к бд: ', err)
        throw new DBError()
      }
    )
  }

  // Получить все типы тикетов
  selectTypesOfTicket = (): Promise<TicketType[]> => {
    const sql = `select t.id, t.title, t.description, t.url_avatar as urlAvatar
                     from ticket_type t`
    return this.pool.query(sql).then(
      ([r]: [TicketType[]]) => {
        if (!r.length) {
          throw new NotFoundError('Категории заявок не найдены')
        }
        return r
      },
      (err: MysqlError) => {
        logger.error('Ошибка запроса к бд: ', err)
        throw new DBError()
      }
    )
  }

  // Получить все тикеты по id типу
  selectTicketsByType = (
    id: number,
    limit: number,
    page: number
  ): Promise<Ticket[]> => {
    const sql = `select t.id,
                            t.title,
                            t.id_ticket_type as idTicketType,
                            t.status,
                            t.created_at     as createdAt,
                            user.nickname    as userNickname,
                            moder.nickname   as moderNickname
                     from ticket t
                              join user on t.id_user = user.id
                              left join user moder on t.id_user_moder = moder.id
                     where t.id_ticket_type = ?
                     limit ? offset ?`
    return this.pool.query(sql, [id, limit, limit * (page - 1)]).then(
      ([r]: [Ticket[]]) => {
        return r
      },
      (err: MysqlError) => {
        logger.error('Ошибка запроса к бд: ', err)
        throw new DBError()
      }
    )
  }

  updateStatus = (
    idTicket: number,
    status: TicketStatus,
    idUser: number
  ): Promise<number> => {
    const sql = `UPDATE ticket
                     SET status        = ?,
                         updated_at    = current_timestamp(),
                         id_user_moder = ?
                     where id = ?`
    return this.pool.query(sql, [status, idUser, idTicket]).then(
      ([r]: [OkPacket]) => {
        if (!r.affectedRows) {
          throw new NotFoundError('Тикет не найден')
        }
        return idTicket
      },
      (err: MysqlError) => {
        logger.error('Ошибка запроса к бд: ', err)
        throw new DBError()
      }
    )
  }

  // Создать комментарий на тикет
  insertComment = (comment: CommentTicket): Promise<number> => {
    const sql = `INSERT INTO ticket_comment (text, id_user, id_ticket)
                     VALUES (?, ?, ?)`
    return this.pool
      .query(sql, [comment.text, comment.idUser, comment.idTicket])
      .then(
        ([r]: [OkPacket]) => {
          return r.insertId
        },
        (err: MysqlError) => {
          logger.error('Ошибка запроса к бд: ', err)
          throw new DBError()
        }
      )
  }

  // Получить комментарии тикетов по id
  selectCommentsByIdTicket = (id: number): Promise<CommentTicket[]> => {
    const sql = `select c.id,
                            c.text,
                            c.id_user    as idUser,
                            c.id_ticket  as idTicket,
                            c.created_at as createdAt,
                            u.nickname   as authorNickname,
                            u.url_avatar as authorUrlAvatar
                     from ticket_comment c
                              join user u on c.id_user = u.id
                     where c.id_ticket = ?`
    return this.pool.query(sql, [id]).then(
      ([r]: [CommentTicket[]]) => {
        return r
      },
      (err: MysqlError) => {
        logger.error('Ошибка запроса к бд: ', err)
        throw new DBError()
      }
    )
  }
}

export default TicketRepository
