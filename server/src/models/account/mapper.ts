import {Account, UserPassword} from '../../common/entity/types'
import {Token} from '../../entity/types'
import logger from '../../services/logger'
import BasicMapper from '../mappers/mapper'

class Mapper extends BasicMapper {

    // Регистрация
    signup = (account: Account) => {
        const sql = `INSERT INTO account (username, sha_pass_hash, email, reg_mail, nickname)
                     VALUES (?, ?, ?, ?, ?)`
        return this.pool.query(sql, [account.username, account.password, account.email, account.email, account.username]).then(([r]: any) => {
            return Promise.resolve(r.insertId)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Авторизация
    login = (account: Account) => {
        const sql = `SELECT u.id
                     FROM account u
                     WHERE u.username = ?
                       AND u.sha_pass_hash = ?`
        return this.pool.query(sql, [account.username, account.password]).then(([r]: any) => {
            if (!r.length) {
                return Promise.reject('Неверный логин или пароль')
            }
            return Promise.resolve(r[0].id)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Сохранить токен
    saveToken = (data: Token) => {
        const sql = 'INSERT INTO token(id_account, text, ip) VALUES(?, ?, ?)'
        return this.pool.query(sql, [data.idAccount, data.text, data.ip]).then(() => {
            return Promise.resolve(data.text)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить контекст
    getContext = (token: string) => {
        const sql = `SELECT t.id_account    AS id,
                            u.nickname   AS nickname,
                            u.url_avatar AS urlAvatar
                     FROM token t
                              JOIN account u ON u.id = t.id_account
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

    // Проверка авторизации по токену
    getIdByToken = (data: string) => {
        const sql = `SELECT id_account AS id
                     FROM token
                     WHERE text = ?`
        return this.pool.query(sql, [data]).then(([r]: any) => {
            if (!r.length) {
                return Promise.reject('Ошибка авторизации')
            }
            return Promise.resolve(r[0].id)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить username по токену
    getUsernameByToken = (token: string) => {
        const sql = `SELECT a.username
                     FROM token t
                        join account a on t.id_account = a.id
                     WHERE t.text = ?`
        return this.pool.query(sql, [token]).then(([r]: any) => {
            if (!r.length) {
                return Promise.reject('Ошибка авторизации')
            }
            return Promise.resolve(r[0].username)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Проверка авторизации по токену и паролю
    getIdByTokenWithPassword = (token: string, pass: string) => {
        const sql = `SELECT t.id_account AS id
                     FROM token t
                              JOIN account a ON a.id = t.id_account
                     WHERE t.text = ?
                       AND a.sha_pass_hash = ?`
        return this.pool.query(sql, [token, pass]).then(([r]: any) => {
            if (!r.length) {
                return Promise.reject('Ошибка авторизации')
            }
            return Promise.resolve(r[0].id)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Выход
    logout = (token: string) => {
        const sql = `DELETE
                     FROM token
                     WHERE text = ?`
        return this.pool.query(sql, [token]).then(() => {
            return Promise.resolve()
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить пользователя по id
    selectById = (id: number) => {
        const sql = `SELECT a.id,
                            a.nickname,
                            a.url_avatar AS urlAvatar
                     FROM account a
                     WHERE a.id = ?`
        return this.pool.query(sql, [id]).then(([r]: [Account[]]) => {
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
        const sql = `SELECT a.nickname,
                            a.url_avatar as urlAvatar,
                            a.username,
                            a.email
                     FROM account a
                     WHERE a.id = ?`
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

    selectAll = (data: any, limit: number, page: number) => {
        let sql = `SELECT id, nickname
                     FROM account`
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
            if (!r.length) {
                return Promise.reject('Не найдены пользователи')
            }
            return Promise.resolve(r)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить количество пользователей
    selectCount = (data: any): Promise<number> => {
        let sql = `SELECT count(id) as count
                   FROM account`
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
    updateGeneral = (user: Account) => {
        const sql = `UPDATE account a
                     SET a.nickname   = ?
                     WHERE a.id = ? `
        return this.pool.query(sql, [user.nickname, user.id]).then(([r]: any) => {
            if (!r.affectedRows) {
                return Promise.reject('Не найден пользователь')
            }
            return Promise.resolve(user.id)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Редактирование настроек безопасноти
    updateSecure = (user: Account) => {
        const sql = `UPDATE account u
                     SET u.email = ?,
                         u.username=?,
                         u.sha_pass_hash=?
                     WHERE u.id = ?`
        return this.pool.query(sql, [user.email, user.username, user.password, user.id]).then(([r]: any) => {
            if (!r.affectedRows) {
                return Promise.reject('Не найден пользователь')
            }
            return Promise.resolve(user.id)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Редактирование пароля
    updatePassword = (user: UserPassword) => {
        const sql = `UPDATE account a
                     SET a.sha_pass_hash = ?
                     WHERE a.id = ?`
        return this.pool.query(sql, [user.password, user.id]).then(([r]: any) => {
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
        const sql = `UPDATE account p
                     SET p.url_avatar = ?
                     WHERE p.id = ?`
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

export default Mapper
