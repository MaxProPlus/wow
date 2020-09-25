import {Character, CommentGuild, Guild, Story} from '../../common/entity/types'
import logger from '../../services/logger'
import BasicMaterialMapper from './material'

class GuildMapper extends BasicMaterialMapper {

    constructor(pool: any) {
        super(pool, 'guild')
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

    // Вставка в таблицу многие ко многим
    insertMember = (id: number, idLink: number) => {
        const sql = `INSERT INTO guild_to_character (id_guild, id_character)
                     VALUES (?, ?)`
        return this.pool.query(sql, [id, idLink]).then(([r]: any) => {
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

    // Получить участников гильдии
    selectMembersById = (id: number): Promise<Character[]> => {
        const sql = `select link.id,
                            link.id_account        as idAccount,
                            link.url_avatar        as urlAvatar,
                            link.title,
                            link.nickname,
                            link.short_description as shortDescription,
                            link.race,
                            link.nation,
                            link.territory,
                            link.age,
                            link.class             as className,
                            link.occupation,
                            link.religion,
                            link.languages,
                            link.description,
                            link.history,
                            link.more,
                            link.sex,
                            link.status,
                            link.active,
                            link.closed,
                            link.hidden,
                            link.comment,
                            link.style
                     from \`character\` link
                              join guild_to_character gtc on link.id = gtc.id_character
                              join guild g on gtc.id_guild = g.id
                     where g.id = ?
                       and link.is_remove = 0`
        return this.pool.query(sql, [id]).then(([r]: [Character[]]) => {
            return Promise.resolve(r)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить сюжеты гильдии
    selectStoresById = (id: number): Promise<Story[]> => {
        const sql = `select link.id,
                            link.id_account        as idAccount,
                            link.url_avatar        as urlAvatar,
                            link.title,
                            link.date_start        as dateStart,
                            link.period,
                            link.short_description as shortDescription,
                            link.description,
                            link.rule,
                            link.more,
                            link.status,
                            link.closed,
                            link.hidden,
                            link.comment,
                            link.style
                     from story link
                              join story_to_guild stg on link.id = stg.id_story
                              join guild c on stg.id_guild = c.id
                     where c.id = ?
                       and link.is_remove = 0`
        return this.pool.query(sql, [id]).then(([r]: [Story[]]) => {
            return Promise.resolve(r)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить все гильдии
    selectAll = (limit: number, page: number, data?: any) => {
        let sql = `select id,
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
        return this.pool.query(sql, [...where, limit, limit * (page - 1)]).then(([r]: [Guild[]]) => {
            return Promise.resolve(r)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить количество гильдий по запросу
    selectCount = (data?: any): Promise<number> => {
        let sql = `select count(id) as count
                   from guild
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

    // Удалить участника из гильдии
    removeMember = (id: number, idLink: number) => {
        const sql = `delete
                     from guild_to_character
                     where id_guild = ?
                       and id_character = ?`
        return this.pool.query(sql, [id, idLink]).then((r: any) => {
            if (!r[0].affectedRows) {
                return Promise.reject('Связь не найдена')
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

export default GuildMapper
