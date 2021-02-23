import {Character, CommentStory, Guild, Report, Story} from '../common/entity/types'
import logger from '../services/logger'
import BasicMaterialRepository from './basicMaterial'
import {DBError, NotFoundError} from '../errors'
import {StoryNotFoundError} from '../providers/story'

class StoryRepository extends BasicMaterialRepository {
    constructor(pool: any) {
        super(pool, 'story')
    }

    // Создать сюжет
    insert = (story: Story): Promise<number> => {
        const {idUser, urlAvatar, title, dateStart, period, shortDescription, description, rule, more, status, closed, hidden, comment, style} = story
        const sql = `INSERT INTO story (id_user, url_avatar, title, period, date_start, short_description,
                                        description, rule, more,
                                        status, closed, hidden, comment, style)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        return this.pool.query(sql, [idUser, urlAvatar, title, period, dateStart, shortDescription,
            description, rule, more, status, closed, hidden, comment, style]).then(([r]: any) => {
            return r.insertId
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Добавить участника сюжета
    insertMember = (id: number, idCharacter: number): Promise<number> => {
        const sql = `INSERT INTO story_to_character (id_story, id_character)
                     VALUES (?, ?)`
        return this.pool.query(sql, [id, idCharacter]).then(([r]: any) => {
            return r.insertId
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Добавить гильдии сюжета
    insertGuild = (id: number, idGuild: number): Promise<number> => {
        const sql = `INSERT INTO story_to_guild (id_story, id_guild)
                     VALUES (?, ?)`
        return this.pool.query(sql, [id, idGuild]).then(([r]: any) => {
            return r.insertId
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Получить сюжет по id
    selectById = (id: number): Promise<Story> => {
        const sql = `select s.id,
                            id_user           as idUser,
                            u.nickname        as userNickname,
                            s.url_avatar      as urlAvatar,
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
                     from story s
                              join user u on s.id_user = u.id
                     where s.id = ?
                       and is_remove = 0`
        return this.pool.query(sql, [id]).then(([r]: [Story[]]) => {
            if (!r.length) {
                throw new StoryNotFoundError()
            }
            // @ts-ignore
            r[0].dateStart.setMinutes(r[0].dateStart.getTimezoneOffset() * -1)
            // @ts-ignore
            r[0].dateStart = r[0].dateStart.toISOString().substr(0, 10)
            return r[0]
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
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
            return r
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
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
            return r
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
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
            return r
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Получить все сюжеты
    selectAll = (limit: number, page: number, data?: any): Promise<Story[]> => {
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
        const {where, sqlWhere} = this.genConditionAnd(data)
        sql += sqlWhere
        sql +=
            ` order by id desc
        limit ? offset ?`
        return this.pool.query(sql, [...where, limit, limit * (page - 1)]).then(([r]: [Story[]]) => {
            return r
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Получить количество сюжетов
    selectCount = (data?: any): Promise<number> => {
        let sql = `select count(id) as count
                   from story
                   where closed = 0
                     and is_remove = 0`
        const {where, sqlWhere} = this.genConditionAnd(data)
        sql += sqlWhere
        return this.pool.query(sql, where).then(([r]: any) => {
            return r[0].count
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Редактировать сюжет
    update = (story: Story): Promise<number> => {
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
                throw new StoryNotFoundError()
            }
            return story.id
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Удалить сюжет
    remove = (id: number): Promise<number> => {
        const sql = `UPDATE story
                     SET is_remove = 1
                     where id = ?`
        return this.pool.query(sql, [id]).then((r: any) => {
            if (!r[0].affectedRows) {
                throw new StoryNotFoundError()
            }
            return id
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Удалить персонажа из сюжета
    removeMember = (id: number, idLink: number): Promise<number> => {
        const sql = `delete
                     from story_to_character
                     where id_story = ?
                       and id_character = ?`
        return this.pool.query(sql, [id, idLink]).then((r: any) => {
            if (!r[0].affectedRows) {
                throw new NotFoundError('Связь не найдена')
            }
            return id
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Удалить гильдию из сюжета
    removeGuild = (id: number, idLink: number): Promise<number> => {
        const sql = `delete
                     from story_to_guild
                     where id_story = ?
                       and id_guild = ?`
        return this.pool.query(sql, [id, idLink]).then((r: any) => {
            if (!r[0].affectedRows) {
                throw new NotFoundError('Связь не найдена')
            }
            return id
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Создать комментарий
    insertComment = (comment: CommentStory): Promise<number> => {
        const sql = `INSERT INTO story_comment (text, id_user, id_story)
                     VALUES (?, ?, ?)`
        return this.pool.query(sql, [comment.text, comment.idUser, comment.idStory]).then(([r]: any) => {
            return r.insertId
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
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
                throw new NotFoundError('Комментарий не найден')
            }
            return r[0]
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Получить комментарии
    selectCommentsByIdStory = (id: number): Promise<CommentStory[]> => {
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
            return r
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Удалить комментарий
    removeComment = (id: number): Promise<number> => {
        const sql = `UPDATE story_comment
                     SET is_remove = 1
                     where id = ?`
        return this.pool.query(sql, [id]).then((r: any) => {
            if (!r[0].affectedRows) {
                throw new NotFoundError('Комментарий не найден')
            }
            return id
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }
}

export default StoryRepository
