import {User, UserPassword} from '../common/entity/types'
import {Token} from '../entity/types'
import logger from '../services/logger'
import Repository from '../core/repository'

class UserRepository extends Repository {

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

    // Авторизация
    login = (user: User) => {
        const sql = `select u.id,
                            a.id as idAccount
                     from user u
                              right join account a on u.id_account = a.id
                     where a.username = ?
                       and a.sha_pass_hash = ?`
        return this.pool.query(sql, [user.username, user.password]).then(([r]: any) => {
            if (!r.length) {
                return Promise.reject('Неверный логин или пароль')
            }
            return Promise.resolve(r[0])
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Сохранить токен
    saveToken = (data: Token) => {
        const sql = 'INSERT INTO token(id_user, text, ip) VALUES(?, ?, ?)'
        return this.pool.query(sql, [data.idUser, data.text, data.ip]).then(() => {
            return Promise.resolve(data.text)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

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

    // Проверка авторизации по токену
    getIdByToken = (data: string) => {
        const sql = `SELECT id_user AS id
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
        const sql = `select a.username
                     from token t
                              join user u on t.id_user = u.id
                              join account a on u.id_account = a.id
                     where t.text = ?`
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
        const sql = `select t.id_user as id
                     from token t
                              join user u on u.id = t.id_user
                              join account a on u.id_account = a.id
                     where t.text = ?
                       and a.sha_pass_hash = ?`
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
                    where.push(`%${data[key]}%`)
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

export default UserRepository
