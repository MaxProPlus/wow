import {User, UserPassword} from '../common/entity/types'
import logger from '../services/logger'
import Repository from '../core/repository'

class RegistrationRepository extends Repository {
    // Занести в бд user
    insertUserReg = (user: User) => {
        const sql = `INSERT INTO user_reg (nickname, username, password, email, token)
                     VALUES (?, ?, ?, ?, ?)`
        return this.pool.query(sql, [user.nickname, user.username, user.password, user.email, user.token]).then(([r]: any) => {
            return Promise.resolve(r.insertId)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Добавить в таблицу сервера игры
    insertAccount = (user: User) => {
        const sql = `INSERT INTO account (username, sha_pass_hash, email, reg_mail)
                     VALUES (?, ?, ?, ?)`
        return this.pool.query(sql, [user.username, user.password, user.email, user.email]).then(([r]: any) => {
            return Promise.resolve(r.insertId)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Добавить в таблицу пользователей сервера
    insertUser = (user: User, idAccount: number) => {
        const sql = `INSERT INTO user (nickname, id_account)
                     VALUES (?, ?)`
        return this.pool.query(sql, [user.nickname, idAccount]).then(([r]: any) => {
            return Promise.resolve(r.insertId)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить пользователя по запросу
    selectAccountByQuery = (data: any) => {
        let sql = `select id
                   from account`
        const where = []
        if (!!data) {
            if (Object.keys(data).length !== 0) {
                sql += ' where'
            }
            let i = 0
            // tslint:disable-next-line:forin
            for (const key in data) {
                if (i++ !== 0) {
                    sql += ` or`
                }
                if (typeof data[key] === 'string') {
                    sql += ` ${key} like ?`
                    where.push(data[key])
                } else {
                    sql += ` ${key} = ?`
                    where.push(data[key])
                }
            }
        }
        return this.pool.query(sql, where).then(([r]: [User[]]) => {
            if (!r.length) {
                return Promise.reject('Не найден пользователь')
            }
            return Promise.resolve(r[0])
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить пользователя по токену регистрации
    selectUserRegByToken = (token: string) => {
        // select name from test_table where created_at > ADDDATE(now(), INTERVAL '-02:00' HOUR_MINUTE);
        const sql = `select nickname, username, password, email
                     from user_reg
                     where is_remove = 0
                       and created_at > ADDDATE(now(), INTERVAL -2 HOUR)
                       and token = ?`
        return this.pool.query(sql, [token]).then(([r]: [User[]]) => {
            if (!r.length) {
                return Promise.reject('Ошибка токена')
            }
            return Promise.resolve(r[0])
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить пользователя по токену
    selectUserEmailByToken = (token: string) => {
        const sql = `select id_user as id, email
                     from user_email
                     where is_remove = 0
                       and created_at > ADDDATE(now(), INTERVAL -2 HOUR)
                       and token = ?`
        return this.pool.query(sql, [token]).then(([r]: [User[]]) => {
            if (!r.length) {
                return Promise.reject('Ошибка токена')
            }
            return Promise.resolve(r[0])
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Редактирование настроек безопасноти
    updateSecure = (user: User) => {
        const sql = `update account a
            join user u on a.id = u.id_account
                     set a.email = ?
                     where u.id = ?`
        return this.pool.query(sql, [user.email, user.id]).then(([r]: any) => {
            if (!r.affectedRows) {
                return Promise.reject('Не найден пользователь')
            }
            return Promise.resolve(user.id)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    insertAccountEmail = (user: User) => {
        const sql = `INSERT INTO user_email (id_user, email, token)
                     VALUES (?, ?, ?)`
        return this.pool.query(sql, [user.id, user.email, user.token]).then(([r]: any) => {
            return Promise.resolve(r.insertId)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Редактирование пароля
    updatePassword = (user: UserPassword) => {
        const sql = `update account a
            join user u on a.id = u.id_account
                     set a.sha_pass_hash = ?
                     where u.id = ?`
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

    // удалить подтверждение пользователя
    removeUserReg = (token: string) => {
        const sql = `UPDATE user_reg
                     SET is_remove = 1
                     WHERE token = ?`
        return this.pool.query(sql, [token]).then(([r]: any) => {
            if (!r.affectedRows) {
                return Promise.reject('Не найден пользователь')
            }
            return Promise.resolve()
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })

    }

    // удалить подтверждение смены email
    removeUserEmail = (token: string) => {
        const sql = `UPDATE user_email
                     SET is_remove = 1
                     WHERE token = ?`
        return this.pool.query(sql, [token]).then(([r]: any) => {
            if (!r.affectedRows) {
                return Promise.reject('Не найден пользователь')
            }
            return Promise.resolve()
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }
}

export default RegistrationRepository