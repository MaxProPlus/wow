import {Character, CommentCharacter, Guild, Report, Story} from '../common/entity/types'
import logger from '../services/logger'
import BasicMaterialRepository from './basicMaterial'

class CharacterRepository extends BasicMaterialRepository {

    constructor(pool: any) {
        super(pool, 'character')
    }

    // Создать персонажа
    insert = (character: Character) => {
        const sql = `INSERT INTO \`character\` (id_user, url_avatar, title, nickname, short_description, race,
                                                nation,
                                                territory, age, class, occupation, religion, languages, description,
                                                history, more,
                                                sex,
                                                status, active, closed, hidden, comment, style)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        return this.pool.query(sql, [character.idUser, character.urlAvatar, character.title, character.nickname, character.shortDescription, character.race, character.nation,
            character.territory, character.age, character.className, character.occupation, character.religion, character.languages, character.description, character.history, character.more, character.sex,
            character.status, character.active, character.closed, character.hidden, character.comment, character.style]).then(([r]: any) => {
            return Promise.resolve(r.insertId)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Вставка в таблицу многие ко многим
    insertLink = (id: number, idLink: number) => {
        const sql = `INSERT INTO character_to_character (id_character, id_character_link)
                     VALUES (?, ?)`
        return this.pool.query(sql, [id, idLink]).then(([r]: any) => {
            return Promise.resolve(r.insertId)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить персонажа по id
    selectById = (id: number): Promise<Character> => {
        const sql = `select id,
                            id_user           as idUser,
                            url_avatar        as urlAvatar,
                            created_at        as createdAt,
                            updated_at        as updatedAt,
                            title,
                            nickname,
                            short_description as shortDescription,
                            race,
                            nation,
                            territory,
                            age,
                            class             as className,
                            occupation,
                            religion,
                            languages,
                            description,
                            history,
                            more,
                            sex,
                            status,
                            active,
                            closed,
                            hidden,
                            comment,
                            style
                     from \`character\` c
                     where c.id = ?
                       and is_remove = 0`
        return this.pool.query(sql, [id]).then(([r]: [Character[]]) => {
            if (!r.length) {
                return Promise.reject('Персонаж не найден')
            }
            return Promise.resolve(r[0])
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить друзей персонажа по id
    selectByIdLink = (id: number): Promise<Character[]> => {
        const sql = `select link.id,
                            link.title,
                            link.url_avatar as urlAvatar
                     from \`character\` link
                              join character_to_character ctc on link.id = ctc.id_character_link
                              join \`character\` c on ctc.id_character = c.id
                     where c.id = ?
                       and link.is_remove = 0`
        return this.pool.query(sql, [id]).then(([r]: [Character[]]) => {
            return Promise.resolve(r)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить гильдии персонажа
    selectGuildsById = (id: number): Promise<Guild[]> => {
        const sql = `select link.id,
                            link.title,
                            link.hidden
                     from guild link
                              join guild_to_character gtc on link.id = gtc.id_guild
                              join \`character\` c on gtc.id_character = c.id
                     where c.id = ?
                       and link.is_remove = 0`
        return this.pool.query(sql, [id]).then(([r]: [Guild[]]) => {
            return Promise.resolve(r)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить сюжеты персонажа
    selectStoresById = (id: number): Promise<Story[]> => {
        const sql = `select link.id,
                            link.title,
                            link.hidden
                     from story link
                              join story_to_character stc on link.id = stc.id_story
                              join \`character\` c on stc.id_character = c.id
                     where c.id = ?
                       and link.is_remove = 0`
        return this.pool.query(sql, [id]).then(([r]: [Story[]]) => {
            return Promise.resolve(r)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить отчеты персонажа
    selectReportsById = (id: number): Promise<Report[]> => {
        const sql = `select link.id,
                            link.title,
                            link.hidden
                     from report link
                              join report_to_character rtc on link.id = rtc.id_report
                              join \`character\` c on rtc.id_character = c.id
                     where c.id = ?
                       and link.is_remove = 0`
        return this.pool.query(sql, [id]).then(([r]: [Report[]]) => {
            return Promise.resolve(r)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить всех персонажей
    selectAll = (limit: number, page: number, data?: any) => {
        let sql = `select c.id,
                          c.url_avatar      as urlAvatar,
                          title,
                          short_description as shortDescription,
                          id_user           as idUser,
                          u.nickname        as userNickname
                   from \`character\` c
                            join user u on c.id_user = u.id
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
        return this.pool.query(sql, [...where, limit, limit * (page - 1)]).then(([r]: [Character[]]) => {
            return Promise.resolve(r)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить количество персонажей
    selectCount = (data?: any): Promise<number> => {
        let sql = `select count(id) as count
                   from \`character\`
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

    // Редактировать персонажа
    update = (character: Character) => {
        const sql = `UPDATE \`character\`
                     SET url_avatar        = ?,
                         updated_at        = current_timestamp(),
                         title             = ?,
                         nickname          = ?,
                         short_description = ?,
                         race              = ?,
                         nation            = ?,
                         territory         = ?,
                         age               = ?,
                         class             = ?,
                         occupation        = ?,
                         religion          = ?,
                         languages         = ?,
                         description       = ?,
                         history           = ?,
                         more              = ?,
                         sex               = ?,
                         status            = ?,
                         active            = ?,
                         closed            = ?,
                         hidden            = ?,
                         comment           = ?,
                         style             = ?
                     where id = ?
                       and is_remove = 0`
        return this.pool.query(sql, [character.urlAvatar, character.title, character.nickname, character.shortDescription, character.race, character.nation,
            character.territory, character.age, character.className, character.occupation, character.religion, character.languages, character.description, character.history, character.more, character.sex,
            character.status, character.active, character.closed, character.hidden, character.comment, character.style, character.id]).then((r: any) => {
            if (!r[0].affectedRows) {
                return Promise.reject('Персонаж не найден')
            }
            return Promise.resolve(character.id)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Удалить персонажа
    remove = (id: number) => {
        const sql = `UPDATE \`character\`
                     SET is_remove = 1
                     where id = ?`
        return this.pool.query(sql, [id]).then((r: any) => {
            if (!r[0].affectedRows) {
                return Promise.reject('Персонаж не найден')
            }
            return Promise.resolve(id)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Удалить персонажа из друзей
    removeLink = (id: number, idLink: number) => {
        const sql = `delete
                     from character_to_character
                     where id_character = ?
                       and id_character_link = ?`
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

    // Создать комментарий к персонажу
    insertComment = (comment: CommentCharacter): Promise<number> => {
        const sql = `INSERT INTO character_comment (text, id_user, id_character)
                     VALUES (?, ?, ?)`
        return this.pool.query(sql, [comment.text, comment.idUser, comment.idCharacter]).then(([r]: any) => {
            return Promise.resolve(r.insertId)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить комментарий по id
    selectCommentById = (id: number): Promise<CommentCharacter> => {
        const sql = `select c.id,
                            c.text,
                            c.id_user      as idUser,
                            c.id_character as idCharacter
                     from character_comment c
                     where c.id = ?
                       and c.is_remove = 0`
        return this.pool.query(sql, [id]).then(([r]: [CommentCharacter[]]) => {
            if (!r.length) {
                return Promise.reject('Комментарий не найден')
            }
            return Promise.resolve(r[0])
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить комментарии к персонажу
    selectCommentsByIdCharacter = (id: number): Promise<CommentCharacter[]> => {
        const sql = `select c.id,
                            c.text,
                            c.id_user      as idUser,
                            c.id_character as idCharacter,
                            c.created_at   as createdAt,
                            c.updated_at   as updatedAt,
                            u.nickname     as authorNickname,
                            u.url_avatar   as authorUrlAvatar
                     from character_comment c
                              join user u on c.id_user = u.id
                     where c.id_character = ?
                       and c.is_remove = 0`
        return this.pool.query(sql, [id]).then(([r]: [CommentCharacter[]]) => {
            return Promise.resolve(r)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Удалить комментарий
    removeComment = (id: number) => {
        const sql = `UPDATE character_comment
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

export default CharacterRepository
