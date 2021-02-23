import {Article, CommentArticle} from '../common/entity/types'
import Repository from '../core/repository'
import {DBError, NotFoundError} from '../errors'
import {ArticleNotFoundError} from '../providers/article'
import {logger} from '../modules/core'
import {MysqlError, OkPacket} from 'mysql'

class ArticleRepository extends Repository {

    // Создать новость
    insert = (a: Article): Promise<number> => {
        const sql = `INSERT INTO article (id_user, url_avatar, title, short_description, description,
                                          closed, hidden, comment, style)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        return this.pool.query(sql, [a.idUser, a.urlAvatar, a.title, a.shortDescription, a.description, a.closed, a.hidden, a.comment, a.style]).then(([r]: [OkPacket]) => {
            return r.insertId
        }, (err: MysqlError) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Получить новость по id
    selectById = (id: number): Promise<Article> => {
        const sql = `select a.id,
                            id_user           as idUser,
                            u.nickname        as userNickname,
                            a.url_avatar      as urlAvatar,
                            created_at        as createdAt,
                            updated_at        as updatedAt,
                            title,
                            short_description as shortDescription,
                            description,
                            closed,
                            hidden,
                            comment,
                            style
                     from article a
                              join user u on a.id_user = u.id
                     where a.id = ?
                       and is_remove = 0`
        return this.pool.query(sql, [id]).then(([r]: [Article[]]) => {
            if (!r.length) {
                throw new ArticleNotFoundError()
            }
            return r[0]
        }, (err: MysqlError) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Получить все новости
    selectAll = (limit: number, page: number, data?: any): Promise<Article[]> => {
        let sql = `select id,
                          url_avatar        as urlAvatar,
                          created_at        as createdAt,
                          title,
                          short_description as shortDescription
                   from article
                   where closed = 0
                     and is_remove = 0`
        const {where, sqlWhere} = this.genConditionAnd(data)
        sql += sqlWhere
        sql +=
            ` order by id desc
        limit ? offset ?`
        return this.pool.query(sql, [...where, limit, limit * (page - 1)]).then(([r]: [Article[]]) => {
            return r
        }, (err: MysqlError) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Получить количество новостей
    selectCount = (data?: any): Promise<number> => {
        let sql = `select count(id) as count
                   from article
                   where closed = 0
                     and is_remove = 0`
        const {where, sqlWhere} = this.genConditionAnd(data)
        sql += sqlWhere
        return this.pool.query(sql, where).then(([r]: any) => {
            return r[0].count
        }, (err: MysqlError) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Редактировать новость
    update = (a: Article): Promise<number> => {
        const sql = `UPDATE article
                     SET url_avatar        = ?,
                         updated_at        = current_timestamp(),
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
            a.closed, a.hidden, a.comment, a.style, a.id]).then(([r]: [OkPacket]) => {
            if (!r.affectedRows) {
                throw new ArticleNotFoundError()
            }
            return a.id
        }, (err: MysqlError) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Удалить новость
    remove = (id: number): Promise<number> => {
        const sql = `UPDATE article
                     SET is_remove = 1
                     where id = ?`
        return this.pool.query(sql, [id]).then(([r]: [OkPacket]) => {
            if (!r.affectedRows) {
                throw new ArticleNotFoundError()
            }
            return id
        }, (err: MysqlError) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Создать комментарий к новости
    insertComment = (comment: CommentArticle): Promise<number> => {
        const sql = `INSERT INTO article_comment (text, id_user, id_article)
                     VALUES (?, ?, ?)`
        return this.pool.query(sql, [comment.text, comment.idUser, comment.idArticle]).then(([r]: [OkPacket]) => {
            return r.insertId
        }, (err: MysqlError) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Получить комментарий по id
    selectCommentById = (id: number): Promise<CommentArticle> => {
        const sql = `select c.id,
                            c.text,
                            c.id_user    as idUser,
                            c.id_article as idArticle
                     from article_comment c
                     where c.id = ?
                       and c.is_remove = 0`
        return this.pool.query(sql, [id]).then(([r]: [CommentArticle[]]) => {
            if (!r.length) {
                throw new NotFoundError('Комментарий не найден')
            }
            return r[0]
        }, (err: MysqlError) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Получить комментарии к новости
    selectCommentsByIdArticle = (id: number): Promise<CommentArticle[]> => {
        const sql = `select c.id,
                            c.text,
                            c.id_user    as idUser,
                            c.id_article as idArticle,
                            c.created_at as createdAt,
                            c.updated_at as updatedAt,
                            u.nickname   as authorNickname,
                            u.url_avatar as authorUrlAvatar
                     from article_comment c
                              join user u on c.id_user = u.id
                     where c.id_article = ?
                       and c.is_remove = 0`
        return this.pool.query(sql, [id]).then(([r]: [CommentArticle[]]) => {
            return r
        }, (err: MysqlError) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Удалить комментарий
    removeComment = (id: number): Promise<number> => {
        const sql = `UPDATE article_comment
                     SET is_remove = 1
                     where id = ?`
        return this.pool.query(sql, [id]).then(([r]: [OkPacket]) => {
            if (!r.affectedRows) {
                throw new NotFoundError('Комментарий не найден')
            }
            return id
        }, (err: MysqlError) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }
}

export default ArticleRepository
