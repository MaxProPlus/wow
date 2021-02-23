import {User, UserPassword} from '../common/entity/types'
import logger from '../services/logger'
import Repository from '../core/repository'
import {DBError, NotFoundError} from '../errors'

class RegistrationRepository extends Repository {
    // Занести в бд user
    insertUserReg = (user: User): Promise<number> => {
        const sql = `INSERT INTO user_reg (nickname, username, password, email, token)
                     VALUES (?, ?, ?, ?, ?)`
        return this.pool.query(sql, [user.nickname, user.username, user.password, user.email, user.token]).then(([r]: any) => {
            return r.insertId
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Добавить в таблицу сервера игры
    insertAccount = (user: User): Promise<number> => {
        const sql = `INSERT INTO account (username, sha_pass_hash, email, reg_mail)
                     VALUES (?, ?, ?, ?)`
        return this.pool.query(sql, [user.username, user.password, user.email, user.email]).then(([r]: any) => {
            return r.insertId
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Добавить в таблицу пользователей сервера
    insertUser = (user: User, idAccount: number): Promise<number> => {
        const sql = `INSERT INTO user (nickname, id_account)
                     VALUES (?, ?)`
        return this.pool.query(sql, [user.nickname, idAccount]).then(([r]: any) => {
            return r.insertId
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Получить аккаунт пользователя по запросу
    selectAccountByQuery = (data: any): Promise<any> => {
        let sql = `select id
                   from account`
        const {where, sqlWhere} = this.genWhereOr(data)
        sql += sqlWhere
        return this.pool.query(sql, where).then(([r]: [User[]]) => {
            return r[0] || null
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Получить пользователя по токену регистрации
    selectUserRegByToken = (token: string): Promise<User> => {
        // select name from test_table where created_at > ADDDATE(now(), INTERVAL '-02:00' HOUR_MINUTE);
        const sql = `select nickname, username, password, email
                     from user_reg
                     where is_remove = 0
                       and created_at > ADDDATE(now(), INTERVAL -2 HOUR)
                       and token = ?`
        return this.pool.query(sql, [token]).then(([r]: [User[]]) => {
            if (!r.length) {
                throw new NotFoundError('Токен не найден или просрочен')
            }
            return r[0]
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Получить пользователя по токену
    selectUserEmailByToken = (token: string): Promise<User> => {
        const sql = `select id_user as id, email
                     from user_email
                     where is_remove = 0
                       and created_at > ADDDATE(now(), INTERVAL -2 HOUR)
                       and token = ?`
        return this.pool.query(sql, [token]).then(([r]: [User[]]) => {
            if (!r.length) {
                throw new NotFoundError('Токен не найден или просрочен')
            }
            return r[0]
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Редактирование настроек безопасноти
    updateSecure = (user: User): Promise<number> => {
        const sql = `update account a
            join user u on a.id = u.id_account
                     set a.email = ?
                     where u.id = ?`
        return this.pool.query(sql, [user.email, user.id]).then(([r]: any) => {
            if (!r.affectedRows) {
                throw new NotFoundError('Не найден пользователь')
            }
            return user.id
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    insertAccountEmail = (user: User): Promise<number> => {
        const sql = `INSERT INTO user_email (id_user, email, token)
                     VALUES (?, ?, ?)`
        return this.pool.query(sql, [user.id, user.email, user.token]).then(([r]: any) => {
            return r.insertId
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Редактирование пароля
    updatePassword = (user: UserPassword): Promise<number> => {
        const sql = `update account a
            join user u on a.id = u.id_account
                     set a.sha_pass_hash = ?
                     where u.id = ?`
        return this.pool.query(sql, [user.password, user.id]).then(([r]: any) => {
            if (!r.affectedRows) {
                throw new NotFoundError('Не найден пользователь')
            }
            return user.id
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // удалить подтверждение пользователя
    removeUserReg = (token: string): Promise<void> => {
        const sql = `UPDATE user_reg
                     SET is_remove = 1
                     WHERE token = ?`
        return this.pool.query(sql, [token]).then(([r]: any) => {
            if (!r.affectedRows) {
                throw new NotFoundError('Не найден пользователь')
            }
            return
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })

    }

    // удалить подтверждение смены email
    removeUserEmail = (token: string): Promise<void> => {
        const sql = `UPDATE user_email
                     SET is_remove = 1
                     WHERE token = ?`
        return this.pool.query(sql, [token]).then(([r]: any) => {
            if (!r.affectedRows) {
                throw new NotFoundError('Не найден пользователь')
            }
            return
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }
}

export default RegistrationRepository