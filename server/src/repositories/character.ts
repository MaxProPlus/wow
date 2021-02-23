import {Character, CommentCharacter, Guild, Report, Story} from '../common/entity/types'
import logger from '../services/logger'
import BasicMaterialRepository from './basicMaterial'
import {DBError, NotFoundError} from '../errors'
import {CharacterNotFoundError} from '../providers/character'

class CharacterRepository extends BasicMaterialRepository {
    constructor(pool: any) {
        super(pool, 'character')
    }

    // Создать персонажа
    insert = (character: Character): Promise<number> => {
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
            return r.insertId
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Вставка в таблицу многие ко многим
    insertLink = (id: number, idLink: number) => {
        const sql = `INSERT INTO character_to_character (id_character, id_character_link)
                     VALUES (?, ?)`
        return this.pool.query(sql, [id, idLink]).then(([r]: any) => {
            return r.insertId
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Получить персонажа по id
    selectById = (id: number): Promise<Character> => {
        const sql = `select c.id,
                            id_user           as idUser,
                            u.nickname        as userNickname,
                            c.url_avatar      as urlAvatar,
                            created_at        as createdAt,
                            updated_at        as updatedAt,
                            title,
                            c.nickname,
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
                              join user u on c.id_user = u.id
                     where c.id = ?
                       and is_remove = 0`
        return this.pool.query(sql, [id]).then(([r]: [Character[]]) => {
            if (!r.length) {
                throw new CharacterNotFoundError()
            }
            return r[0]
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
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
            return r
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
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
            return r
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
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
            return r
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
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
            return r
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Получить всех персонажей
    selectAll = (limit: number, page: number, data?: any): Promise<Character[]> => {
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
        const {where, sqlWhere} = this.genConditionAnd(data)
        sql += sqlWhere
        sql +=
            ` order by id desc
        limit ? offset ?`
        return this.pool.query(sql, [...where, limit, limit * (page - 1)]).then(([r]: [Character[]]) => {
            return r
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Получить количество персонажей
    selectCount = (data?: any): Promise<number> => {
        let sql = `select count(id) as count
                   from \`character\`
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

    // Редактировать персонажа
    update = (character: Character): Promise<number> => {
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
                throw new CharacterNotFoundError()
            }
            return character.id
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Удалить персонажа
    remove = (id: number): Promise<number> => {
        const sql = `UPDATE \`character\`
                     SET is_remove = 1
                     where id = ?`
        return this.pool.query(sql, [id]).then((r: any) => {
            if (!r[0].affectedRows) {
                throw new CharacterNotFoundError()
            }
            return id
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
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
                throw new NotFoundError('Связь не найдена')
            }
            return id
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Создать комментарий к персонажу
    insertComment = (comment: CommentCharacter): Promise<number> => {
        const sql = `INSERT INTO character_comment (text, id_user, id_character)
                     VALUES (?, ?, ?)`
        return this.pool.query(sql, [comment.text, comment.idUser, comment.idCharacter]).then(([r]: any) => {
            return r.insertId
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
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
                throw new NotFoundError('Комментарий не найден')
            }
            return r[0]
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
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
            return r
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Удалить комментарий
    removeComment = (id: number): Promise<number> => {
        const sql = `UPDATE character_comment
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

export default CharacterRepository
