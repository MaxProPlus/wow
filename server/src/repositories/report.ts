import {Character, CommentReport, Guild, Report, Story} from '../common/entity/types'
import BasicMaterialRepository from './basicMaterial'
import {DBError, NotFoundError} from '../errors'
import {ReportNotFoundError} from '../providers/report'
import {logger} from '../modules/core'
import {MysqlError, OkPacket} from 'mysql'

class ReportRepository extends BasicMaterialRepository {

    constructor(pool: any) {
        super(pool, 'report')
    }

    // Создать отчет / лог
    insert = (report: Report): Promise<number> => {
        const {idUser, urlAvatar, title, shortDescription, description, rule, closed, hidden, comment, style} = report
        const sql = `INSERT INTO report (id_user, url_avatar, title, short_description,
                                         description, rule, closed, hidden, comment, style)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        return this.pool.query(sql, [idUser, urlAvatar, title, shortDescription,
            description, rule, closed, hidden, comment, style]).then(([r]: [OkPacket]) => {
            return r.insertId
        }, (err: MysqlError) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Добавить участника лога
    insertMember = (id: number, idReport: number): Promise<number> => {
        const sql = `INSERT INTO report_to_character (id_report, id_character)
                     VALUES (?, ?)`
        return this.pool.query(sql, [id, idReport]).then(([r]: [OkPacket]) => {
            return r.insertId
        }, (err: MysqlError) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Добавить гильдии отчета
    insertGuild = (id: number, idGuild: number): Promise<number> => {
        const sql = `INSERT INTO report_to_guild (id_report, id_guild)
                     VALUES (?, ?)`
        return this.pool.query(sql, [id, idGuild]).then(([r]: [OkPacket]) => {
            return r.insertId
        }, (err: MysqlError) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Добавить сюжет отчета
    insertStory = (id: number, idStory: number): Promise<number> => {
        const sql = `INSERT INTO report_to_story (id_report, id_story)
                     VALUES (?, ?)`
        return this.pool.query(sql, [id, idStory]).then(([r]: [OkPacket]) => {
            return r.insertId
        }, (err: MysqlError) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
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
                throw new ReportNotFoundError()
            }
            return r[0]
        }, (err: MysqlError) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
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
            return r
        }, (err: MysqlError) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
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
            return r
        }, (err: MysqlError) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
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
            return r
        }, (err: MysqlError) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Получить все отчеты / логи
    selectAll = (limit: number, page: number, data?: any): Promise<Report[]> => {
        let sql = `select r.id,
                          r.url_avatar as urlAvatar,
                          title,
                          id_user      as idUser,
                          u.nickname   as userNickname
                   from report r
                            join user u on r.id_user = u.id
                   where closed = 0
                     and is_remove = 0`

        const {where, sqlWhere} = this.genConditionAnd(data)
        sql += sqlWhere
        sql +=
            ` order by id desc
        limit ? offset ?`
        return this.pool.query(sql, [...where, limit, limit * (page - 1)]).then(([r]: [Report[]]) => {
            return r
        }, (err: MysqlError) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Получить количество отчетов
    selectCount = (data?: any): Promise<number> => {
        let sql = `select count(id) as count
                   from report
                   where closed = 0
                     and is_remove = 0`
        const {where, sqlWhere} = this.genConditionAnd(data)
        sql += sqlWhere
        return this.pool.query(sql, where).then(([r]: any) => {
            return r[0].count
        }, (err: MysqlError) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Редактировать отчет
    update = (report: Report): Promise<number> => {
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
        return this.pool.query(sql, [urlAvatar, title, shortDescription, description, rule, closed, hidden, comment, style, id]).then(([r]: [OkPacket]) => {
            if (!r.affectedRows) {
                throw new ReportNotFoundError()
            }
            return report.id
        }, (err: MysqlError) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Удалить отчет
    remove = (id: number): Promise<number> => {
        const sql = `UPDATE report
                     SET is_remove = 1
                     where id = ?`
        return this.pool.query(sql, [id]).then(([r]: [OkPacket]) => {
            if (!r.affectedRows) {
                throw new ReportNotFoundError()
            }
            return id
        }, (err: MysqlError) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Удалить персонажа из отчета
    removeMember = (id: number, idLink: number): Promise<number> => {
        const sql = `delete
                     from report_to_character
                     where id_report = ?
                       and id_character = ?`
        return this.pool.query(sql, [id, idLink]).then(([r]: [OkPacket]) => {
            if (!r.affectedRows) {
                throw new NotFoundError('Связь не найдена')
            }
            return id
        }, (err: MysqlError) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Удалить гильдию из отчета
    removeGuild = (id: number, idLink: number): Promise<number> => {
        const sql = `delete
                     from report_to_guild
                     where id_report = ?
                       and id_guild = ?`
        return this.pool.query(sql, [id, idLink]).then(([r]: [OkPacket]) => {
            if (!r.affectedRows) {
                throw new NotFoundError('Связь не найдена')
            }
            return id
        }, (err: MysqlError) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Удалить сюжет из отчета
    removeStory = (id: number, idLink: number): Promise<number> => {
        const sql = `delete
                     from report_to_story
                     where id_report = ?
                       and id_story = ?`
        return this.pool.query(sql, [id, idLink]).then(([r]: [OkPacket]) => {
            if (!r.affectedRows) {
                throw new NotFoundError('Связь не найдена')
            }
            return id
        }, (err: MysqlError) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Создать комментарий
    insertComment = (comment: CommentReport): Promise<number> => {
        const sql = `INSERT INTO report_comment (text, id_user, id_report)
                     VALUES (?, ?, ?)`
        return this.pool.query(sql, [comment.text, comment.idUser, comment.idReport]).then(([r]: [OkPacket]) => {
            return r.insertId
        }, (err: MysqlError) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
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
                throw new NotFoundError('Комментарий не найден')
            }
            return r[0]
        }, (err: MysqlError) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Получить комментарии
    selectCommentsByIdReport = (id: number): Promise<CommentReport[]> => {
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
            return r
        }, (err: MysqlError) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Удалить комментарий
    removeComment = (id: number): Promise<number> => {
        const sql = `UPDATE report_comment
                     SET is_remove = 1
                     where id = ?`
        return this.pool.query(sql, [id]).then(([r]: [OkPacket]) => {
            if (!r.affectedRows) {
                throw new NotFoundError('Комментарий не найден')
            }
            return id
        }, (err: MysqlError) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }
}

export default ReportRepository
