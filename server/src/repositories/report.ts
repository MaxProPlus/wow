import {Character, CommentReport, Guild, Report, Story} from '../common/entity/types'
import logger from '../services/logger'
import BasicMaterialRepository from './basicMaterial'

class ReportRepository extends BasicMaterialRepository {

    constructor(pool: any) {
        super(pool, 'report')
    }

    // Создать отчет / лог
    insert = (report: Report) => {
        const {idUser, urlAvatar, title, shortDescription, description, rule, closed, hidden, comment, style} = report
        const sql = `INSERT INTO report (id_user, url_avatar, title, short_description,
                                         description, rule, closed, hidden, comment, style)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        return this.pool.query(sql, [idUser, urlAvatar, title, shortDescription,
            description, rule, closed, hidden, comment, style]).then(([r]: any) => {
            return Promise.resolve(r.insertId)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Добавить участника лога
    insertMember = (id: number, idReport: number) => {
        const sql = `INSERT INTO report_to_character (id_report, id_character)
                     VALUES (?, ?)`
        return this.pool.query(sql, [id, idReport]).then(([r]: any) => {
            return Promise.resolve(r.insertId)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Добавить гильдии отчета
    insertGuild = (id: number, idGuild: number) => {
        const sql = `INSERT INTO report_to_guild (id_report, id_guild)
                     VALUES (?, ?)`
        return this.pool.query(sql, [id, idGuild]).then(([r]: any) => {
            return Promise.resolve(r.insertId)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Добавить сюжет отчета
    insertStory = (id: number, idStory: number) => {
        const sql = `INSERT INTO report_to_story (id_report, id_story)
                     VALUES (?, ?)`
        return this.pool.query(sql, [id, idStory]).then(([r]: any) => {
            return Promise.resolve(r.insertId)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить отчет по id
    selectById = (id: number): Promise<Report> => {
        const sql = `select r.id,
                            id_user           as idUser,
                            u.nickname        as userNickname,
                            r.url_avatar      as urlAvatar,
                            created_at        as createdAt,
                            updated_at        as updatedAt,
                            title,
                            short_description as shortDescription,
                            description,
                            rule,
                            closed,
                            hidden,
                            comment,
                            style
                     from report r
                              join user u on r.id_user = u.id
                     where r.id = ?
                       and is_remove = 0`
        return this.pool.query(sql, [id]).then(([r]: [Report[]]) => {
            if (!r.length) {
                return Promise.reject('Отчет / лог не найден')
            }
            return Promise.resolve(r[0])
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить участников отчета / лога
    selectMembersById = (id: number): Promise<Character[]> => {
        const sql = `select link.id,
                            link.url_avatar as urlAvatar,
                            link.title
                     from \`character\` link
                              join report_to_character rtc on link.id = rtc.id_character
                              join report s on rtc.id_report = s.id
                     where s.id = ?
                       and link.is_remove = 0`
        return this.pool.query(sql, [id]).then(([r]: [Character[]]) => {
            return Promise.resolve(r)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить гильдии отчета
    selectGuildsById = (id: number): Promise<Guild[]> => {
        const sql = `select link.id,
                            link.title,
                            link.hidden
                     from guild link
                              join report_to_guild rtg on link.id = rtg.id_guild
                              join report s on rtg.id_report = s.id
                     where s.id = ?
                       and link.is_remove = 0`
        return this.pool.query(sql, [id]).then(([r]: [Guild[]]) => {
            return Promise.resolve(r)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить сюжеты отчета
    selectStoresById = (id: number): Promise<Story[]> => {
        const sql = `select link.id,
                            link.title,
                            link.hidden
                     from story link
                              join report_to_story rts on link.id = rts.id_story
                              join report s on rts.id_report = s.id
                     where s.id = ?
                       and link.is_remove = 0`
        return this.pool.query(sql, [id]).then(([r]: [Story[]]) => {
            return Promise.resolve(r)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить все отчеты / логи
    selectAll = (limit: number, page: number, data?: any) => {
        let sql = `select r.id,
                          r.url_avatar as urlAvatar,
                          title,
                          id_user      as idUser,
                          u.nickname   as userNickname
                   from report r
                            join user u on r.id_user = u.id
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
        return this.pool.query(sql, [...where, limit, limit * (page - 1)]).then(([r]: [Report[]]) => {
            return Promise.resolve(r)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить количество отчетов
    selectCount = (data?: any): Promise<number> => {
        let sql = `select count(id) as count
                   from report
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

    // Редактировать отчет
    update = (report: Report) => {
        const {id, urlAvatar, title, shortDescription, description, rule, closed, hidden, comment, style} = report
        const sql = `UPDATE report
                     SET url_avatar        = ?,
                         updated_at        = current_timestamp(),
                         title             = ?,
                         short_description = ?,
                         description       = ?,
                         rule              = ?,
                         closed            = ?,
                         hidden            = ?,
                         comment           = ?,
                         style             = ?
                     where id = ?
                       and is_remove = 0`
        return this.pool.query(sql, [urlAvatar, title, shortDescription, description, rule, closed, hidden, comment, style, id]).then((r: any) => {
            if (!r[0].affectedRows) {
                return Promise.reject('Отчет / лог не найден')
            }
            return Promise.resolve(report.id)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Удалить отчет
    remove = (id: number) => {
        const sql = `UPDATE report
                     SET is_remove = 1
                     where id = ?`
        return this.pool.query(sql, [id]).then((r: any) => {
            if (!r[0].affectedRows) {
                return Promise.reject('Отчет / лог не найден')
            }
            return Promise.resolve(id)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Удалить персонажа из отчета
    removeMember = (id: number, idLink: number) => {
        const sql = `delete
                     from report_to_character
                     where id_report = ?
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

    // Удалить гильдию из отчета
    removeGuild = (id: number, idLink: number) => {
        const sql = `delete
                     from report_to_guild
                     where id_report = ?
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

    // Удалить сюжет из отчета
    removeStory = (id: number, idLink: number) => {
        const sql = `delete
                     from report_to_story
                     where id_report = ?
                       and id_story = ?`
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
    insertComment = (comment: CommentReport): Promise<number> => {
        const sql = `INSERT INTO report_comment (text, id_user, id_report)
                     VALUES (?, ?, ?)`
        return this.pool.query(sql, [comment.text, comment.idUser, comment.idReport]).then(([r]: any) => {
            return Promise.resolve(r.insertId)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить комментарий по id
    selectCommentById = (id: number): Promise<CommentReport> => {
        const sql = `select c.id,
                            c.text,
                            c.id_user   as idUser,
                            c.id_report as idReport
                     from report_comment c
                     where c.id = ?
                       and c.is_remove = 0`
        return this.pool.query(sql, [id]).then(([r]: [CommentReport[]]) => {
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
    selectCommentsByIdReport = (id: number) => {
        const sql = `select c.id,
                            c.text,
                            c.id_user    as idUser,
                            c.id_report  as idReport,
                            c.created_at as createdAt,
                            c.updated_at as updatedAt,
                            u.nickname   as authorNickname,
                            u.url_avatar as authorUrlAvatar
                     from report_comment c
                              join user u on c.id_user = u.id
                     where c.id_report = ?
                       and c.is_remove = 0`
        return this.pool.query(sql, [id]).then(([r]: [CommentReport[]]) => {
            return Promise.resolve(r)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Удалить комментарий
    removeComment = (id: number) => {
        const sql = `UPDATE report_comment
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

export default ReportRepository
