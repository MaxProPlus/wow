import {Article, CommentArticle} from '../../common/entity/types'
import logger from '../../services/logger'
import BasicMapper from './mapper'

class ArticleMapper extends BasicMapper {

    // Создать новость
    insert = (a: Article) => {
        const sql = `INSERT INTO article (id_user, url_avatar, title, short_description, description,
                                          closed, hidden, comment, style)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        return this.pool.query(sql, [a.idUser, a.urlAvatar, a.title, a.shortDescription, a.description, a.closed, a.hidden, a.comment, a.style]).then(([r]: any) => {
            return Promise.resolve(r.insertId)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить новость по id
    selectById = (id: number): Promise<Article> => {
        const sql = `select id,
                            id_user           as idUser,
                            url_avatar        as urlAvatar,
                            title,
                            short_description as shortDescription,
                            description,
                            closed,
                            hidden,
                            comment,
                            style
                     from article
                     where id = ?
                       and is_remove = 0`
        return this.pool.query(sql, [id]).then(([r]: [Article[]]) => {
            if (!r.length) {
                return Promise.reject('Новость не найдена')
            }
            return Promise.resolve(r[0])
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить все новости
    selectAll = (limit: number, page: number, data?: any) => {
        let sql = `select id,
                          id_user           as idUser,
                          url_avatar        as urlAvatar,
                          title,
                          short_description as shortDescription,
                          description,
                          closed,
                          hidden,
                          comment,
                          style
                   from article
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
        return this.pool.query(sql, [...where, limit, limit * (page - 1)]).then(([r]: [Article[]]) => {
            return Promise.resolve(r)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить количество новостей
    selectCount = (data?: any): Promise<number> => {
        let sql = `select count(id) as count
                   from article
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

    // Редактировать новость
    update = (a: Article) => {
        const sql = `UPDATE article
                     SET url_avatar        = ?,
                         title             = ?,
                         short_description = ?,
                         description       = ?,
                         closed            = ?,
                         hidden            = ?,
                         comment           = ?,
                         style             = ?
                     where id = ?
                       and is_remove = 0`
        return this.pool.query(sql, [a.urlAvatar, a.title, a.shortDescription, a.description,
            a.closed, a.hidden, a.comment, a.style, a.id]).then((r: any) => {
            if (!r[0].affectedRows) {
                return Promise.reject('Новость не найдена')
            }
            return Promise.resolve(a.id)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Удалить новость
    remove = (id: number) => {
        const sql = `UPDATE article
                     SET is_remove = 1
                     where id = ?`
        return this.pool.query(sql, [id]).then((r: any) => {
            if (!r[0].affectedRows) {
                return Promise.reject('Новость не найдена')
            }
            return Promise.resolve(id)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Создать комментарий к новости
    insertComment = (comment: CommentArticle): Promise<number> => {
        const sql = `INSERT INTO article_comment (text, id_user, id_article)
                     VALUES (?, ?, ?)`
        return this.pool.query(sql, [comment.text, comment.idUser, comment.idArticle]).then(([r]: any) => {
            return Promise.resolve(r.insertId)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить комментарии к новости
    selectCommentsByIdArticle = (id: number): Promise<CommentArticle[]> => {
        const sql = `select c.id,
                            c.text,
                            c.id_user      as idUser,
                            c.id_article as idArticle,
                            u.nickname     as authorNickname,
                            u.url_avatar   as authorUrlAvatar
                     from article_comment c
                              join user u on c.id_user = u.id
                     where c.id_article = ?
                       and c.is_remove = 0`
        return this.pool.query(sql, [id]).then(([r]: [CommentArticle[]]) => {
            return Promise.resolve(r)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Удалить комментарий
    removeComment = (id: number) => {
        const sql = `UPDATE article_comment
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

export default ArticleMapper
