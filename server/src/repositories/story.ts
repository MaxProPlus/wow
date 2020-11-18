import {Character, CommentStory, Guild, Report, Story} from '../common/entity/types'
import logger from '../services/logger'
import BasicMaterialRepository from './basicMaterial'

class StoryRepository extends BasicMaterialRepository {
    constructor(pool: any) {
        super(pool, 'story')
    }

    // Создать сюжет
    insert = (story: Story) => {
        const {idUser, urlAvatar, title, dateStart, period, shortDescription, description, rule, more, status, closed, hidden, comment, style} = story
        const sql = `INSERT INTO story (id_user, url_avatar, title, period, date_start, short_description,
                                        description, rule, more,
                                        status, closed, hidden, comment, style)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        return this.pool.query(sql, [idUser, urlAvatar, title, period, dateStart, shortDescription,
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
                            id_user           as idUser,
                            url_avatar        as urlAvatar,
                            created_at        as createdAt,
                            updated_at        as updatedAt,
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
                            link.url_avatar as urlAvatar,
                            link.title
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
                            link.title,
                            link.hidden
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

    // Получить отчеты сюжета
    selectReportsById = (id: number): Promise<Report[]> => {
        const sql = `select link.id,
                            link.title,
                            link.hidden
                     from report link
                              join report_to_story rts on link.id = rts.id_report
                              join story s on rts.id_story = s.id
                     where s.id = ?
                       and link.is_remove = 0`
        return this.pool.query(sql, [id]).then(([r]: [Report[]]) => {
            return Promise.resolve(r)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить все сюжеты
    selectAll = (limit: number, page: number, data?: any) => {
        let sql = `select s.id,
                          s.url_avatar      as urlAvatar,
                          title,
                          short_description as shortDescription,
                          id_user           as idUser,
                          u.nickname        as userNickname
                   from story s
                            join user u on s.id_user = u.id
                   where closed = 0
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
    selectCount = (data?: any): Promise<number> => {
        let sql = `select count(id) as count
                   from story
                   where closed = 0
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

    // Редактировать сюжет
    update = (story: Story) => {
        const {id, urlAvatar, title, dateStart, period, shortDescription, description, rule, more, status, closed, hidden, comment, style} = story
        const sql = `UPDATE story
                     SET url_avatar        = ?,
                         updated_at        = current_timestamp(),
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
        const sql = `INSERT INTO story_comment (text, id_user, id_story)
                     VALUES (?, ?, ?)`
        return this.pool.query(sql, [comment.text, comment.idUser, comment.idStory]).then(([r]: any) => {
            return Promise.resolve(r.insertId)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить комментарий по id
    selectCommentById = (id: number): Promise<CommentStory> => {
        const sql = `select c.id,
                            c.text,
                            c.id_user  as idUser,
                            c.id_story as idStory
                     from story_comment c
                     where c.id = ?
                       and c.is_remove = 0`
        return this.pool.query(sql, [id]).then(([r]: [CommentStory[]]) => {
            if (!r.length) {
                return Promise.reject('Комментарий не найден')
            }
            return Promise.resolve(r[0])
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить комментарии
    selectCommentsByIdStory = (id: number) => {
        const sql = `select c.id,
                            c.text,
                            c.id_user    as idUser,
                            c.id_story   as idStory,
                            c.created_at as createdAt,
                            c.updated_at as updatedAt,
                            u.nickname   as authorNickname,
                            u.url_avatar as authorUrlAvatar
                     from story_comment c
                              join user u on c.id_user = u.id
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

export default StoryRepository
