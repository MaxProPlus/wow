import {Character, CommentCharacter, Guild, Story} from '../../common/entity/types'
import logger from '../../services/logger'
import BasicMaterialMapper from './material'

class CharacterMapper extends BasicMaterialMapper {

    constructor(pool: any) {
        super(pool, 'character')
    }

    // Создать персонажа
    insert = (character: Character) => {
        const sql = `INSERT INTO \`character\` (id_account, url_avatar, title, nickname, short_description, race,
                                                nation,
                                                territory, age, class, occupation, religion, languages, description,
                                                history, more,
                                                sex,
                                                status, active, closed, hidden, comment, style)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        return this.pool.query(sql, [character.idAccount, character.urlAvatar, character.title, character.nickname, character.shortDescription, character.race, character.nation,
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
                            id_account        as idAccount,
                            url_avatar        as urlAvatar,
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
                              join character_to_character ctc on link.id = ctc.id_character_link
                              join \`character\` c on ctc.id_character = c.id
                     where c.id = 10
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

    // Получить всех персонажей
    selectAll = (limit: number, page: number, data?: any) => {
        let sql = `select id,
                          id_account        as idAccount,
                          url_avatar        as urlAvatar,
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

    // Редактировать персонажа
    update = (character: Character) => {
        const sql = `UPDATE \`character\`
                     SET url_avatar        = ?,
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
        const sql = `INSERT INTO character_comment (text, id_account, id_character)
                     VALUES (?, ?, ?)`
        return this.pool.query(sql, [comment.text, comment.idAccount, comment.idCharacter]).then(([r]: any) => {
            return Promise.resolve(r.insertId)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить комментарии к персонажу
    selectCommentsByIdCharacter = (id: number): Promise<CommentCharacter[]> => {
        const sql = `select c.id,
                            c.text,
                            c.id_account   as idAccount,
                            c.id_character as idCharacter,
                            a.nickname     as authorNickname,
                            a.url_avatar   as authorUrlAvatar
                     from character_comment c
                              join account a on c.id_account = a.id
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
                return Promise.reject('Комментай не найден')
            }
            return Promise.resolve(id)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }
}

export default CharacterMapper
