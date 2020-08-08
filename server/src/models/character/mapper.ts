import {Character, CommentCharacter, CommentTicket} from '../../common/entity/types'
import logger from '../../services/logger'

class Mapper {
    private pool: any

    constructor(pool: any) {
        this.pool = pool
    }

    // Создать персонажа
    insert = (character: Character) => {
        const sql = `INSERT INTO \`character\` (id_account, url_avatar, title, nickname, short_description, race,
                                                nation,
                                                territory, age, class, occupation, religion, languages, description,
                                                sex,
                                                status, active, closed, hidden, comment, style)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        return this.pool.query(sql, [character.idAccount, character.urlAvatar, character.title, character.nickname, character.shortDescription, character.race, character.nation,
            character.territory, character.age, character.className, character.occupation, character.religion, character.languages, character.description, character.sex,
            character.status, character.active, character.closed, character.hidden, character.comment, character.style]).then(([r]: any) => {
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
                            sex,
                            status,
                            active,
                            closed,
                            hidden,
                            comment,
                            style
                     from \`character\` c
                     where c.id = ?`
        return this.pool.query(sql, [id]).then(([r]: [Character[]]) => {
            if (!r.length) {
                return Promise.reject('Не найден персонаж')
            }
            return Promise.resolve(r[0])
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить всех персонажей
    selectAll = (limit: number, page: number) => {
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
                     order by id desc
                     limit ? offset ?`
        return this.pool.query(sql, [limit, limit * (page - 1)]).then(([r]: [Character[]]) => {
            return Promise.resolve(r)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }


    // Получить количество персонажей
    selectCount = (): Promise<number> => {
        const sql = `select count(id) as count
                     from \`character\`
                     where hidden=0 and closed=0`
        return this.pool.query(sql).then(([r]: any) => {
            if (!r.length) {
                return Promise.reject('Не найдены персонажи')
            }
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
                         sex               = ?,
                         status            = ?,
                         active            = ?,
                         closed            = ?,
                         hidden            = ?,
                         comment           = ?,
                         style             = ?
                     where id = ?`
        return this.pool.query(sql, [character.urlAvatar, character.title, character.nickname, character.shortDescription, character.race, character.nation,
            character.territory, character.age, character.className, character.occupation, character.religion, character.languages, character.description, character.sex,
            character.status, character.active, character.closed, character.hidden, character.comment, character.style, character.id]).then((r: any) => {
            if (!r[0].affectedRows) {
                return Promise.reject('Не найден персонаж')
            }
            return Promise.resolve(character.id)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Удалить персонажа
    remove = (id: number) => {

    }

    // Создать комментарий к персонажу
    insertComment = (comment: CommentCharacter) => {
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
    selectCommentsByIdCharacter = (id: number) => {
        const sql = `select c.id,
                            c.text,
                            c.id_account as idAccount,
                            c.id_character  as idCharacter,
                            a.nickname   as authorNickname,
                            a.url_avatar as authorUrlAvatar
                     from character_comment c
                              join account a on c.id_account = a.id
                     where c.id_character = ?`
        return this.pool.query(sql, [id]).then(([r]: [CommentCharacter[]]) => {
            return Promise.resolve(r)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Удалить комментарий
    removeComment = (id: number) => {

    }
}

export default Mapper
