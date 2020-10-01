import {CommentForum, Forum} from '../../common/entity/types'
import logger from '../../services/logger'
import BasicMaterialMapper from './material'

class ForumMapper extends BasicMaterialMapper {
    constructor(pool: any) {
        super(pool, 'forum')
    }

    // Создать форум
    insert = (forum: Forum) => {
        const {idUser, urlAvatar, title, shortDescription, description, rule, closed, hidden, comment, style} = forum
        const sql = `INSERT INTO forum (id_user, url_avatar, title, short_description,
                                        description, rule, closed, hidden, comment, style)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        return this.pool.query(sql, [idUser, urlAvatar, title, shortDescription,
            description, rule, closed, hidden, comment, style]).then(([r]: any) => {
            return Promise.resolve(r.insertId)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить форум по id
    selectById = (id: number): Promise<Forum> => {
        const sql = `select id,
                            id_user        as idUser,
                            url_avatar        as urlAvatar,
                            title,
                            short_description as shortDescription,
                            description,
                            rule,
                            closed,
                            hidden,
                            comment,
                            style
                     from forum
                     where id = ?
                       and is_remove = 0`
        return this.pool.query(sql, [id]).then(([r]: [Forum[]]) => {
            if (!r.length) {
                return Promise.reject('Форум не найден')
            }
            return Promise.resolve(r[0])
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить список форумов
    selectAll = (limit: number, page: number, data?: any) => {
        let sql = `select id,
                          id_user        as idUser,
                          url_avatar        as urlAvatar,
                          title,
                          short_description as shortDescription,
                          description,
                          rule,
                          closed,
                          hidden,
                          comment,
                          style
                   from forum
                   where hidden = 0
                     and closed = 0
                     and is_remove = 0`

        const where = []
        if (!!data) {
            // tslint:disable-next-line:forin
            for (const key in data) {
                if (typeof data[key] === 'string') {
                    sql += ` and ${key} like ?`
                    where.push(`%${data[key]}%`)
                } else {
                    sql += ` and ${key} = ?`
                    where.push(data[key])
                }
            }
        }
        sql +=
            ` order by id desc
        limit ? offset ?`
        return this.pool.query(sql, [...where, limit, limit * (page - 1)]).then(([r]: [Forum[]]) => {
            return Promise.resolve(r)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить количество форумов
    selectCount = (data?: any): Promise<number> => {
        let sql = `select count(id) as count
                   from forum
                   where hidden = 0
                     and closed = 0
                     and is_remove = 0`
        const where = []
        if (!!data) {
            // tslint:disable-next-line:forin
            for (const key in data) {
                if (typeof data[key] === 'string') {
                    sql += ` and ${key} like ?`
                    where.push(`%${data[key]}%`)
                } else {
                    sql += ` and ${key} = ?`
                    where.push(data[key])
                }
            }
        }
        return this.pool.query(sql, where).then(([r]: any) => {
            return Promise.resolve(r[0].count)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Редактировать форум
    update = (report: Forum) => {
        const {id, urlAvatar, title, shortDescription, description, rule, closed, hidden, comment, style} = report
        const sql = `UPDATE forum
                     SET url_avatar        = ?,
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
        return this.pool.query(sql, [urlAvatar, title, shortDescription, description, rule, closed, hidden, comment, style, id]).then((r: any) => {
            if (!r[0].affectedRows) {
                return Promise.reject('Форум не найден')
            }
            return Promise.resolve(report.id)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Удалить форум
    remove = (id: number) => {
        const sql = `UPDATE forum
                     SET is_remove = 1
                     where id = ?`
        return this.pool.query(sql, [id]).then((r: any) => {
            if (!r[0].affectedRows) {
                return Promise.reject('Форум не найден')
            }
            return Promise.resolve(id)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Создать комментарий
    insertComment = (comment: CommentForum): Promise<number> => {
        const sql = `INSERT INTO forum_comment (text, id_user, id_forum)
                     VALUES (?, ?, ?)`
        return this.pool.query(sql, [comment.text, comment.idUser, comment.idForum]).then(([r]: any) => {
            return Promise.resolve(r.insertId)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить комментарии
    selectCommentsByIdForum = (id: number) => {
        const sql = `select c.id,
                            c.text,
                            c.id_user as idUser,
                            c.id_forum   as idForum,
                            u.nickname   as authorNickname,
                            u.url_avatar as authorUrlAvatar
                     from forum_comment c
                              join user u on c.id_user = u.id
                     where c.id_forum = ?
                       and c.is_remove = 0`
        return this.pool.query(sql, [id]).then(([r]: [CommentForum[]]) => {
            return Promise.resolve(r)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Удалить комментарий
    removeComment = (id: number) => {
        const sql = `UPDATE forum_comment
                     SET is_remove = 1
                     where id = ?`
        return this.pool.query(sql, [id]).then((r: any) => {
            if (!r[0].affectedRows) {
                return Promise.reject('Комментарий не найден')
            }
            return Promise.resolve(id)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }
}

export default ForumMapper
