import {User} from '../common/entity/types'
import logger from '../services/logger'
import Repository from '../core/repository'
import {DBError, NotFoundError, UnauthorizedError} from '../errors'

class UserRepository extends Repository {

    // Получить контекст
    getContext = (token: string): Promise<User> => {
        const sql = `SELECT t.id_user    AS id,
                            u.nickname   AS nickname,
                            u.url_avatar AS urlAvatar
                     FROM token t
                              JOIN user u ON u.id = t.id_user
                     WHERE t.text = ?`
        return this.pool.query(sql, [token]).then(([r]: any) => {
            if (!r.length) {
                throw new UnauthorizedError()
            }
            return r[0]
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Получить пользователя по id
    selectById = (id: number): Promise<User> => {
        const sql = `SELECT u.id,
                            u.nickname,
                            u.url_avatar AS urlAvatar
                     FROM user u
                     WHERE u.id = ?`
        return this.pool.query(sql, [id]).then(([r]: [User[]]) => {
            if (!r.length) {
                throw new NotFoundError('Не найден пользователь')
            }
            return r[0]
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Получить информацию о пользователе
    selectUserGeneralById = (id: number): Promise<User> => {
        const sql = `SELECT u.nickname,
                            u.link_ds    as linkDs,
                            u.link_mail  as linkMail,
                            u.link_vk    as linkVk,
                            u.link_tg    as linkTg,
                            u.url_avatar as urlAvatar,
                            a.email
                     FROM user u
                              join account a on u.id_account = a.id
                     WHERE u.id = ?`
        return this.pool.query(sql, [id]).then(([r]: any) => {
            if (!r.length) {
                throw new NotFoundError('Не найден пользователь')
            }
            return r[0]
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Выборка всех пользователей
    selectAll = (limit: number, page: number, data?: any): Promise<User[]> => {
        let sql = `SELECT id, nickname
                   FROM user`
        const {where, sqlWhere} = this.genWhereAnd(data)
        sql += sqlWhere
        sql += ` order by id desc
        limit ? offset ?`
        return this.pool.query(sql, [...where, limit, limit * (page - 1)]).then(([r]: any) => {
            return r
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Получить количество пользователей
    selectCount = (data: any): Promise<number> => {
        let sql = `SELECT count(id) as count
                   FROM user`
        const {where, sqlWhere} = this.genWhereAnd(data)
        sql += sqlWhere
        return this.pool.query(sql, where).then(([r]: any) => {
            return r[0].count
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Редактирование основной информации
    updateGeneral = (user: User): Promise<number> => {
        const sql = `UPDATE user
                     SET nickname  = ?,
                         link_ds   = ?,
                         link_mail = ?,
                         link_vk   = ?,
                         link_tg   = ?
                     WHERE id = ? `
        return this.pool.query(sql, [user.nickname, user.linkDs, user.linkMail, user.linkVk, user.linkTg, user.id]).then(([r]: any) => {
            if (!r.affectedRows) {
                throw new NotFoundError('Не найден пользователь')
            }
            return user.id
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Загрузка аватарки
    updateAvatar = (id: number, avatarUrl: string): Promise<number> => {
        const sql = `UPDATE user u
                     SET u.url_avatar = ?
                     WHERE u.id = ?`
        return this.pool.query(sql, [avatarUrl, id]).then(([r]: any) => {
            if (!r.affectedRows) {
                throw new NotFoundError('Не найден пользователь')
            }
            return id
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })

    }
}

export default UserRepository
