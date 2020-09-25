import {Character, CommentReport, Report} from '../../common/entity/types'
import logger from '../../services/logger'
import BasicMaterialMapper from './material'

class ReportMapper extends BasicMaterialMapper{

    constructor(pool: any) {
        super(pool, 'report')
    }

    // Создать отчет / лог
    insert = (report: Report) => {
        const {idAccount, urlAvatar, title, shortDescription, description, rule, closed, hidden, comment, style} = report
        const sql = `INSERT INTO report (id_account, url_avatar, title, short_description,
                                         description, rule, closed, hidden, comment, style)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        return this.pool.query(sql, [idAccount, urlAvatar, title, shortDescription,
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

    // Получить отчет по id
    selectById = (id: number): Promise<Report> => {
        const sql = `select id,
                            id_account        as idAccount,
                            url_avatar        as urlAvatar,
                            title,
                            short_description as shortDescription,
                            description,
                            rule,
                            closed,
                            hidden,
                            comment,
                            style
                     from report
                     where id = ?
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

    // Получить все отчеты / логи
    selectAll = (limit: number, page: number) => {
        const sql = `select id,
                            id_account        as idAccount,
                            url_avatar        as urlAvatar,
                            title,
                            short_description as shortDescription,
                            description,
                            rule,
                            closed,
                            hidden,
                            comment,
                            style
                     from report
                     where id = ?
                       and hidden = 0
                       and closed = 0
                       and is_remove = 0
                     order by id desc
                     limit ? offset ?`
        return this.pool.query(sql, [limit, limit * (page - 1)]).then(([r]: [Report[]]) => {
            return Promise.resolve(r)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить все отчеты по запросу
    selectByQuery = (data: any, limit: number, page: number) => {
        let sql = `select id,
                            id_account        as idAccount,
                            url_avatar        as urlAvatar,
                            title,
                            short_description as shortDescription,
                            description,
                            rule,
                            closed,
                            hidden,
                            comment,
                            style
                     from report
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
        return this.pool.query(sql, [...where, limit, limit * (page - 1)]).then(([r]: [Report[]]) => {
            return Promise.resolve(r)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить количество отчетов
    selectCount = (): Promise<number> => {
        const sql = `select count(id) as count
                     from report
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

    // Получить количество отчетов по запросу
    selectCountByQuery = (data: any): Promise<number> => {
        let sql = `select count(id) as count
                     from report
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
        return this.pool.query(sql, [...where]).then(([r]: any) => {
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

    // Создать комментарий
    insertComment = (comment: CommentReport): Promise<number> => {
        const sql = `INSERT INTO report_comment (text, id_account, id_report)
                     VALUES (?, ?, ?)`
        return this.pool.query(sql, [comment.text, comment.idAccount, comment.idReport]).then(([r]: any) => {
            return Promise.resolve(r.insertId)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить комментарии
    selectCommentsByIdReport = (id: number) => {
        const sql = `select c.id,
                            c.text,
                            c.id_account as idAccount,
                            c.id_report  as idReport,
                            a.nickname   as authorNickname,
                            a.url_avatar as authorUrlAvatar
                     from report_comment c
                              join account a on c.id_account = a.id
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

export default ReportMapper
