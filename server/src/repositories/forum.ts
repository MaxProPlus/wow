import {CommentForum, Forum} from '../common/entity/types'
import BasicMaterialRepository from './basicMaterial'
import {DBError, NotFoundError} from '../errors'
import {ForumNotFoundError} from '../providers/forum'
import {logger} from '../modules/core'
import {MysqlError, OkPacket} from 'mysql'

class ForumRepository extends BasicMaterialRepository {
  constructor(pool: any) {
    super(pool, 'forum')
  }

  // Создать форум
  insert = (forum: Forum): Promise<number> => {
    const {
      idUser,
      urlAvatar,
      title,
      shortDescription,
      description,
      rule,
      closed,
      hidden,
      comment,
      style,
    } = forum
    const sql = `INSERT INTO forum (id_user, url_avatar, title, short_description,
                                        description, rule, closed, hidden, comment, style)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    return this.pool
      .query(sql, [
        idUser,
        urlAvatar,
        title,
        shortDescription,
        description,
        rule,
        closed,
        hidden,
        comment,
        style,
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

  // Получить форум по id
  selectById = (id: number): Promise<Forum> => {
    const sql = `select f.id,
                            id_user           as idUser,
                            u.nickname        as userNickname,
                            f.url_avatar      as urlAvatar,
                            created_at        as createdAt,
                            updated_at        as updatedAt,
                            title,
                            short_description as shortDescription,
                            description,
                            rule,
                            closed,
                            hidden,
                            comment,
                            style
                     from forum f
                              join user u on f.id_user = u.id
                     where f.id = ?
                       and is_remove = 0`
    return this.pool.query(sql, [id]).then(
      ([r]: [Forum[]]) => {
        if (!r.length) {
          throw new ForumNotFoundError()
        }
        return r[0]
      },
      (err: MysqlError) => {
        logger.error('Ошибка запроса к бд: ', err)
        throw new DBError()
      }
    )
  }

  // Получить список форумов
  selectAll = (limit: number, page: number, data?: any): Promise<Forum> => {
    let sql = `select f.id,
                          f.url_avatar      as urlAvatar,
                          created_at        as createdAt,
                          title,
                          short_description as shortDescription,
                          id_user           as idUser,
                          u.nickname        as userNickname
                   from forum f
                            join user u on f.id_user = u.id
                   where closed = 0
                     and is_remove = 0`
    const {where, sqlWhere} = this.genConditionAnd(data)
    sql += sqlWhere
    sql += ` order by id desc
        limit ? offset ?`
    return this.pool.query(sql, [...where, limit, limit * (page - 1)]).then(
      ([r]: [Forum[]]) => {
        return r
      },
      (err: MysqlError) => {
        logger.error('Ошибка запроса к бд: ', err)
        throw new DBError()
      }
    )
  }

  // Получить количество форумов
  selectCount = (data?: any): Promise<number> => {
    let sql = `select count(id) as count
                   from forum
                   where closed = 0
                     and is_remove = 0`
    const {where, sqlWhere} = this.genConditionAnd(data)
    sql += sqlWhere
    return this.pool.query(sql, where).then(
      ([r]: any) => {
        return r[0].count
      },
      (err: MysqlError) => {
        logger.error('Ошибка запроса к бд: ', err)
        throw new DBError()
      }
    )
  }

  // Редактировать форум
  update = (report: Forum): Promise<number> => {
    const {
      id,
      urlAvatar,
      title,
      shortDescription,
      description,
      rule,
      closed,
      hidden,
      comment,
      style,
    } = report
    const sql = `UPDATE forum
                     SET url_avatar        = ?,
                         updated_at        = current_timestamp(),
                         title             = ?,
                         short_description = ?,
                         description       = ?,
                         rule              = ?,
                         closed            = ?,
                         hidden            = ?,
                         comment           = ?,
                         style             = ?
                     where id = ?
                       and is_remove = 0`
    return this.pool
      .query(sql, [
        urlAvatar,
        title,
        shortDescription,
        description,
        rule,
        closed,
        hidden,
        comment,
        style,
        id,
      ])
      .then(
        ([r]: [OkPacket]) => {
          if (!r.affectedRows) {
            throw new ForumNotFoundError()
          }
          return report.id
        },
        (err: MysqlError) => {
          logger.error('Ошибка запроса к бд: ', err)
          throw new DBError()
        }
      )
  }

  // Удалить форум
  remove = (id: number): Promise<number> => {
    const sql = `UPDATE forum
                     SET is_remove = 1
                     where id = ?`
    return this.pool.query(sql, [id]).then(
      ([r]: [OkPacket]) => {
        if (!r.affectedRows) {
          throw new ForumNotFoundError()
        }
        return id
      },
      (err: MysqlError) => {
        logger.error('Ошибка запроса к бд: ', err)
        throw new DBError()
      }
    )
  }

  // Создать комментарий
  insertComment = (comment: CommentForum): Promise<number> => {
    const sql = `INSERT INTO forum_comment (text, id_user, id_forum)
                     VALUES (?, ?, ?)`
    return this.pool
      .query(sql, [comment.text, comment.idUser, comment.idForum])
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

  // Получить комментарий по id
  selectCommentById = (id: number): Promise<CommentForum> => {
    const sql = `select c.id,
                            c.text,
                            c.id_user  as idUser,
                            c.id_forum as idForum
                     from forum_comment c
                     where c.id = ?
                       and c.is_remove = 0`
    return this.pool.query(sql, [id]).then(
      ([r]: [CommentForum[]]) => {
        if (!r.length) {
          throw new NotFoundError('Комментарий не найден')
        }
        return r[0]
      },
      (err: MysqlError) => {
        logger.error('Ошибка запроса к бд: ', err)
        throw new DBError()
      }
    )
  }

  // Получить комментарии
  selectCommentsByIdForum = (id: number): Promise<CommentForum[]> => {
    const sql = `select c.id,
                            c.text,
                            c.id_user    as idUser,
                            c.id_forum   as idForum,
                            c.created_at as createdAt,
                            c.updated_at as updatedAt,
                            u.nickname   as authorNickname,
                            u.url_avatar as authorUrlAvatar
                     from forum_comment c
                              join user u on c.id_user = u.id
                     where c.id_forum = ?
                       and c.is_remove = 0`
    return this.pool.query(sql, [id]).then(
      ([r]: [CommentForum[]]) => {
        return r
      },
      (err: MysqlError) => {
        logger.error('Ошибка запроса к бд: ', err)
        throw new DBError()
      }
    )
  }

  // Удалить комментарий
  removeComment = (id: number): Promise<number> => {
    const sql = `UPDATE forum_comment
                     SET is_remove = 1
                     where id = ?`
    return this.pool.query(sql, [id]).then(
      ([r]: [OkPacket]) => {
        if (!r.affectedRows) {
          throw new NotFoundError('Комментарий не найден')
        }
        return id
      },
      (err: MysqlError) => {
        logger.error('Ошибка запроса к бд: ', err)
        throw new DBError()
      }
    )
  }
}

export default ForumRepository
