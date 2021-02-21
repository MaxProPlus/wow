import {User} from '../common/entity/types'
import {Token} from '../entity/types'
import logger from '../services/logger'
import Repository from '../core/repository'

class AuthRepository extends Repository {

    // Аутентификация
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

    // Получить пользователя по токену
    getUserByToken = (token: string) => {
        const sql = `SELECT id_user AS id
                     FROM token
                     WHERE text = ?`
        return this.pool.query(sql, [token]).then(([r]: any) => {
            return Promise.resolve(r[0])
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить пользователя с правами по токену
    getUserWithRightsByToken = (token: string) => {
        const sql = `select t.id_user as id, p.name
                     from token t
                              left join ar_user_role aur on t.id_user = aur.id_user
                              left join ar_role_permission arp on aur.id_role = arp.id_role
                              left join ar_permission p on p.id = arp.id_permission
                     where t.text = ?`
        return this.pool.query(sql, [token]).then(([r]: any) => {
            if (!r) {
                return Promise.resolve(null)
            }
            const user = new User()
            user.id = r[0].id
            if (r[0].name) {
                user.rights = r.map((el: any)=>el.name)
            }
            return Promise.resolve(user)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить пользователя по токену и паролю
    getUserByTokenAndPassword = (token: string, pass: string) => {
        const sql = `select t.id_user as id, a.username
                     from token t
                              join user u on u.id = t.id_user
                              join account a on u.id_account = a.id
                     where t.text = ?
                       and a.sha_pass_hash = ?`
        return this.pool.query(sql, [token, pass]).then(([r]: any) => {
            if (!r.length) {
                return null
            }
            return Promise.resolve(r[0])
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить username по токену
    getUsernameByToken = (token: string): Promise<string | null> => {
        const sql = `select a.username
                     from token t
                              join user u on t.id_user = u.id
                              join account a on u.id_account = a.id
                     where t.text = ?`
        return this.pool.query(sql, [token]).then(([r]: any) => {
            if (!r.length) {
                return null
            }
            return Promise.resolve(r[0].username)
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
}

export default AuthRepository
