import {CommentGuild, Guild} from '../../common/entity/types'
import logger from '../../services/logger'

class Mapper {
    private pool: any

    constructor(pool: any) {
        this.pool = pool
    }

    // Создать гильдию
    insert = (guild: Guild) => {
        const {idAccount, urlAvatar, title, gameTitle, ideology, shortDescription, description, rule, more, status, kit, closed, hidden, comment, style} = guild
        const sql = `INSERT INTO guild (id_account, url_avatar, title, game_title, ideology, short_description,
                                        description, rule, more,
                                        status, kit, closed, hidden, comment, style)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        return this.pool.query(sql, [idAccount, urlAvatar, title, gameTitle, ideology, shortDescription, description, rule, more,
            status, kit, closed, hidden, comment, style]).then(([r]: any) => {
            return Promise.resolve(r.insertId)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить гильдию по id
    selectById = (id: number): Promise<Guild> => {
        const sql = `select id,
                            id_account        as idAccount,
                            url_avatar        as urlAvatar,
                            title,
                            game_title        as gameTitle,
                            short_description as shortDescription,
                            ideology,
                            description,
                            rule,
                            more,
                            status,
                            kit,
                            closed,
                            hidden,
                            comment,
                            style
                     from guild
                     where id = ?
                       and is_remove = 0`
        return this.pool.query(sql, [id]).then(([r]: [Guild[]]) => {
            if (!r.length) {
                return Promise.reject('Гильдия не найдена')
            }
            return Promise.resolve(r[0])
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить все гильдии
    selectAll = (limit: number, page: number) => {
        const sql = `select id,
                            id_account        as idAccount,
                            url_avatar        as urlAvatar,
                            title,
                            game_title        as gameTitle,
                            short_description as shortDescription,
                            ideology,
                            description,
                            rule,
                            more,
                            status,
                            kit,
                            closed,
                            hidden,
                            comment,
                            style
                     from guild
                     where hidden = 0
                       and closed = 0
                       and is_remove = 0
                     order by id desc
                     limit ? offset ?`
        return this.pool.query(sql, [limit, limit * (page - 1)]).then(([r]: [Guild[]]) => {
            return Promise.resolve(r)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить гильдии по запросу
    selectByQuery = (query: string, limit: number, page: number) => {
        query = '%' + query + '%'
        const sql = `select id,
                            id_account        as idAccount,
                            url_avatar        as urlAvatar,
                            title,
                            game_title        as gameTitle,
                            short_description as shortDescription,
                            ideology,
                            description,
                            rule,
                            more,
                            status,
                            kit,
                            closed,
                            hidden,
                            comment,
                            style
                     from guild
                     where (title LIKE ?
                         or game_title like ?)
                       and hidden = 0
                       and closed = 0
                       and is_remove = 0
                     order by id desc
                     limit ? offset ?`
        return this.pool.query(sql, [query, query, limit, limit * (page - 1)]).then(([r]: [Guild[]]) => {
            return Promise.resolve(r)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить количество гильдий
    selectCount = (): Promise<number> => {
        const sql = `select count(id) as count
                     from guild
                     where hidden = 0
                       and closed = 0
                       and is_remove = 0`
        return this.pool.query(sql).then(([r]: any) => {
            return Promise.resolve(r[0].count)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить количество гильдий по запросу
    selectCountByQuery = (query: string): Promise<number> => {
        query = '%' + query + '%'
        const sql = `select count(id) as count
                     from guild
                     where (title LIKE ?
                         or game_title like ?)
                       and hidden = 0
                       and closed = 0
                       and is_remove = 0`
        return this.pool.query(sql, [query, query]).then(([r]: any) => {
            return Promise.resolve(r[0].count)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Редактировать гильдию
    update = (guild: Guild) => {
        const {id, urlAvatar, title, gameTitle, shortDescription, ideology, description, rule, more, status, kit, closed, hidden, comment, style} = guild
        const sql = `UPDATE guild
                     SET url_avatar        = ?,
                         title             = ?,
                         game_title        = ?,
                         short_description = ?,
                         ideology          = ?,
                         description       = ?,
                         rule              = ?,
                         more              = ?,
                         status            = ?,
                         kit               = ?,
                         closed            = ?,
                         hidden            = ?,
                         comment           = ?,
                         style             = ?
                     where id = ?
                       and is_remove = 0`
        return this.pool.query(sql, [urlAvatar, title, gameTitle, shortDescription, ideology, description, rule, more, status, kit, closed, hidden, comment, style, id]).then((r: any) => {
            if (!r[0].affectedRows) {
                return Promise.reject('Гильдия не найдена')
            }
            return Promise.resolve(guild.id)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Удалить гильдию
    remove = (id: number) => {
        const sql = `UPDATE guild
                     SET is_remove = 1
                     where id = ?`
        return this.pool.query(sql, [id]).then((r: any) => {
            if (!r[0].affectedRows) {
                return Promise.reject('Гильдия не найдена')
            }
            return Promise.resolve(id)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Создать комментарий
    insertComment = (comment: CommentGuild): Promise<number> => {
        const sql = `INSERT INTO guild_comment (text, id_account, id_guild)
                     VALUES (?, ?, ?)`
        return this.pool.query(sql, [comment.text, comment.idAccount, comment.idGuild]).then(([r]: any) => {
            return Promise.resolve(r.insertId)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить комментарии
    selectCommentsByIdGuild = (id: number) => {
        const sql = `select c.id,
                            c.text,
                            c.id_account as idAccount,
                            c.id_guild   as idGuild,
                            a.nickname   as authorNickname,
                            a.url_avatar as authorUrlAvatar
                     from guild_comment c
                              join account a on c.id_account = a.id
                     where c.id_guild = ?
                       and c.is_remove = 0`
        return this.pool.query(sql, [id]).then(([r]: [CommentGuild[]]) => {
            return Promise.resolve(r)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Удалить комментарий
    removeComment = (id: number) => {
        const sql = `UPDATE guild_comment
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

export default Mapper
