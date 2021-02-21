import {User} from '../common/entity/types'
import logger from '../services/logger'
import Repository from '../core/repository'

class UserRepository extends Repository {

    // Получить контекст
    getContext = (token: string) => {
        const sql = `SELECT t.id_user    AS id,
                            u.nickname   AS nickname,
                            u.url_avatar AS urlAvatar
                     FROM token t
                              JOIN user u ON u.id = t.id_user
                     WHERE t.text = ?`
        return this.pool.query(sql, [token]).then(([r]: any) => {
            if (!r.length) {
                return Promise.reject('Неверный токен')
            }
            return Promise.resolve(r[0])
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить пользователя по id
    selectById = (id: number) => {
        const sql = `SELECT u.id,
                            u.nickname,
                            u.url_avatar AS urlAvatar
                     FROM user u
                     WHERE u.id = ?`
        return this.pool.query(sql, [id]).then(([r]: [User[]]) => {
            if (!r.length) {
                return Promise.reject('Не найден пользователь')
            }
            return Promise.resolve(r[0])
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить информацию о пользователе
    selectUserGeneralById = (id: number) => {
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
                return Promise.reject('Не найден пользователь')
            }
            return Promise.resolve(r[0])
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Выборка всех пользователей
    selectAll = (limit: number, page: number, data?: any) => {
        let sql = `SELECT id, nickname
                   FROM user`
        const where = []
        if (!!data) {
            if (Object.keys(data).length !== 0) {
                sql += ' where'
            }
            let i = 0
            // tslint:disable-next-line:forin
            for (const key in data) {
                if (i++ !== 0) {
                    sql += ` and`
                }
                if (typeof data[key] === 'string') {
                    sql += ` ${key} like ?`
                    where.push(`%${data[key]}%`)
                } else {
                    sql += ` ${key} = ?`
                    where.push(data[key])
                }
            }
        }
        sql += ` order by id desc
        limit ? offset ?`
        return this.pool.query(sql, [...where, limit, limit * (page - 1)]).then(([r]: any) => {
            return Promise.resolve(r)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить количество пользователей
    selectCount = (data: any): Promise<number> => {
        let sql = `SELECT count(id) as count
                   FROM user`
        const where = []
        if (!!data) {
            if (Object.keys(data).length !== 0) {
                sql += ' where'
            }
            let i = 0
            // tslint:disable-next-line:forin
            for (const key in data) {
                if (i++ !== 0) {
                    sql += ` and`
                }
                if (typeof data[key] === 'string') {
                    sql += ` ${key} like ?`
                    where.push(`%${data[key]}%`)
                } else {
                    sql += ` ${key} = ?`
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

    // Редактирование основной информации
    updateGeneral = (user: User) => {
        const sql = `UPDATE user
                     SET nickname  = ?,
                         link_ds   = ?,
                         link_mail = ?,
                         link_vk   = ?,
                         link_tg   = ?
                     WHERE id = ? `
        return this.pool.query(sql, [user.nickname, user.linkDs, user.linkMail, user.linkVk, user.linkTg, user.id]).then(([r]: any) => {
            if (!r.affectedRows) {
                return Promise.reject('Не найден пользователь')
            }
            return Promise.resolve(user.id)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Загрузка аватарки
    updateAvatar = (id: number, avatarUrl: string) => {
        const sql = `UPDATE user u
                     SET u.url_avatar = ?
                     WHERE u.id = ?`
        return this.pool.query(sql, [avatarUrl, id]).then(([r]: any) => {
            if (!r.affectedRows) {
                return Promise.reject('Не найден пользователь')
            }
            return Promise.resolve(id)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })

    }
}

export default UserRepository
