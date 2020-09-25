import {Character, CommentStory, Guild, Story} from '../../common/entity/types'
import logger from '../../services/logger'
import BasicMaterialMapper from './material'

class StoryMapper extends BasicMaterialMapper {
    constructor(pool: any) {
        super(pool, 'story')
    }

    // Создать сюжет
    insert = (story: Story) => {
        const {idAccount, urlAvatar, title, dateStart, period, shortDescription, description, rule, more, status, closed, hidden, comment, style} = story
        const sql = `INSERT INTO story (id_account, url_avatar, title, period, date_start, short_description,
                                        description, rule, more,
                                        status, closed, hidden, comment, style)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        return this.pool.query(sql, [idAccount, urlAvatar, title, period, dateStart, shortDescription,
            description, rule, more, status, closed, hidden, comment, style]).then(([r]: any) => {
            return Promise.resolve(r.insertId)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Добавить участника сюжета
    insertMember = (id: number, idCharacter: number) => {
        const sql = `INSERT INTO story_to_character (id_story, id_character)
                     VALUES (?, ?)`
        return this.pool.query(sql, [id, idCharacter]).then(([r]: any) => {
            return Promise.resolve(r.insertId)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Добавить гильдии сюжета
    insertGuild = (id: number, idGuild: number) => {
        const sql = `INSERT INTO story_to_guild (id_story, id_guild)
                     VALUES (?, ?)`
        return this.pool.query(sql, [id, idGuild]).then(([r]: any) => {
            return Promise.resolve(r.insertId)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить сюжет по id
    selectById = (id: number): Promise<Story> => {
        const sql = `select id,
                            id_account        as idAccount,
                            url_avatar        as urlAvatar,
                            title,
                            date_start        as dateStart,
                            period,
                            short_description as shortDescription,
                            description,
                            rule,
                            more,
                            status,
                            closed,
                            hidden,
                            comment,
                            style
                     from story
                     where id = ?
                       and is_remove = 0`
        return this.pool.query(sql, [id]).then(([r]: [Story[]]) => {
            if (!r.length) {
                return Promise.reject('Сюжет не найден')
            }
            // @ts-ignore
            r[0].dateStart.setMinutes(r[0].dateStart.getTimezoneOffset() * -1)
            // @ts-ignore
            r[0].dateStart = r[0].dateStart.toISOString().substr(0, 10)
            return Promise.resolve(r[0])
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить участников сюжета
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
                              join story_to_character gtc on link.id = gtc.id_character
                              join story s on gtc.id_story = s.id
                     where s.id = ?
                       and link.is_remove = 0`
        return this.pool.query(sql, [id]).then(([r]: [Character[]]) => {
            return Promise.resolve(r)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить гильдии сюжета
    selectGuildsById = (id: number): Promise<Guild[]> => {
        const sql = `select link.id,
                            link.id_account        as idAccount,
                            link.url_avatar        as urlAvatar,
                            link.title,
                            link.game_title        as gameTitle,
                            link.short_description as shortDescription,
                            link.ideology,
                            link.description,
                            link.rule,
                            link.more,
                            link.status,
                            link.kit,
                            link.closed,
                            link.hidden,
                            link.comment,
                            link.style
                     from guild link
                              join story_to_guild stg on link.id = stg.id_guild
                              join story s on stg.id_story = s.id
                     where s.id = ?
                       and link.is_remove = 0`
        return this.pool.query(sql, [id]).then(([r]: [Guild[]]) => {
            return Promise.resolve(r)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить все сюжеты
    selectAll = (limit: number, page: number) => {
        const sql = `select id,
                            id_account        as idAccount,
                            url_avatar        as urlAvatar,
                            title,
                            date_start        as dateStart,
                            period,
                            short_description as shortDescription,
                            description,
                            rule,
                            more,
                            status,
                            closed,
                            hidden,
                            comment,
                            style
                     from story
                     where hidden = 0
                       and closed = 0
                       and is_remove = 0
                     order by id desc
                     limit ? offset ?`
        return this.pool.query(sql, [limit, limit * (page - 1)]).then(([r]: [Story[]]) => {
            return Promise.resolve(r)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить все сюжеты по запросу
    selectByQuery = (data: any, limit: number, page: number) => {
        let sql = `select id,
                          id_account        as idAccount,
                          url_avatar        as urlAvatar,
                          title,
                          date_start        as dateStart,
                          period,
                          short_description as shortDescription,
                          description,
                          rule,
                          more,
                          status,
                          closed,
                          hidden,
                          comment,
                          style
                   from story
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
        return this.pool.query(sql, [...where, limit, limit * (page - 1)]).then(([r]: [Story[]]) => {
            return Promise.resolve(r)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить количество сюжетов
    selectCount = (): Promise<number> => {
        const sql = `select count(id) as count
                     from story
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

    // Получить количество сюжетов по запросу
    selectCountByQuery = (query: string): Promise<number> => {
        query = '%' + query + '%'
        const sql = `select count(id) as count
                     from story
                     where title like ?
                       and hidden = 0
                       and closed = 0
                       and is_remove = 0`
        return this.pool.query(sql, [query]).then(([r]: any) => {
            return Promise.resolve(r[0].count)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Редактировать сюжет
    update = (story: Story) => {
        const {id, urlAvatar, title, dateStart, period, shortDescription, description, rule, more, status, closed, hidden, comment, style} = story
        const sql = `UPDATE story
                     SET url_avatar        = ?,
                         title             = ?,
                         date_start        = ?,
                         period            = ?,
                         short_description = ?,
                         description       = ?,
                         rule              = ?,
                         more              = ?,
                         status            = ?,
                         closed            = ?,
                         hidden            = ?,
                         comment           = ?,
                         style             = ?
                     where id = ?
                       and is_remove = 0`
        return this.pool.query(sql, [urlAvatar, title, dateStart, period, shortDescription, description, rule, more, status, closed, hidden, comment, style, id]).then((r: any) => {
            if (!r[0].affectedRows) {
                return Promise.reject('Сюжет не найден')
            }
            return Promise.resolve(story.id)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Удалить сюжет
    remove = (id: number) => {
        const sql = `UPDATE story
                     SET is_remove = 1
                     where id = ?`
        return this.pool.query(sql, [id]).then((r: any) => {
            if (!r[0].affectedRows) {
                return Promise.reject('Сюжет не найден')
            }
            return Promise.resolve(id)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Удалить персонажа из сюжета
    removeMember = (id: number, idLink: number) => {
        const sql = `delete
                     from story_to_character
                     where id_story = ?
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

    // Удалить гильдию из сюжета
    removeGuild = (id: number, idLink: number) => {
        const sql = `delete
                     from story_to_guild
                     where id_story = ?
                       and id_guild = ?`
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
    insertComment = (comment: CommentStory): Promise<number> => {
        const sql = `INSERT INTO story_comment (text, id_account, id_story)
                     VALUES (?, ?, ?)`
        return this.pool.query(sql, [comment.text, comment.idAccount, comment.idStory]).then(([r]: any) => {
            return Promise.resolve(r.insertId)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить комментарии
    selectCommentsByIdStory = (id: number) => {
        const sql = `select c.id,
                            c.text,
                            c.id_account as idAccount,
                            c.id_story   as idStory,
                            a.nickname   as authorNickname,
                            a.url_avatar as authorUrlAvatar
                     from story_comment c
                              join account a on c.id_account = a.id
                     where c.id_story = ?
                       and c.is_remove = 0`
        return this.pool.query(sql, [id]).then(([r]: [CommentStory[]]) => {
            return Promise.resolve(r)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Удалить комментарий
    removeComment = (id: number) => {
        const sql = `UPDATE story_comment
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

export default StoryMapper
