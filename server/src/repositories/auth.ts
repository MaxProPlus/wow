import {User} from '../common/entity/types'
import {Token} from '../entity/types'
import Repository from '../core/repository'
import {DBError} from '../errors'
import {AuthError} from '../providers/auth'
import {logger} from '../modules/core'
import {MysqlError} from 'mysql'

class AuthRepository extends Repository {
  // Аутентификация
  login = (user: User): Promise<any> => {
    const sql = `select u.id,
                            a.id as idAccount
                     from user u
                              right join account a on u.id_account = a.id
                     where a.username = ?
                       and a.sha_pass_hash = ?`
    return this.pool.query(sql, [user.username, user.password]).then(
      ([r]: any) => {
        if (!r.length) {
          throw new AuthError('Неверный логин или пароль')
        }
        return r[0]
      },
      (err: MysqlError) => {
        logger.error('Ошибка запроса к бд: ', err)
        throw new DBError()
      }
    )
  }

  // Сохранить токен
  saveToken = (data: Token): Promise<string> => {
    const sql = 'INSERT INTO token(id_user, text, ip) VALUES(?, ?, ?)'
    return this.pool.query(sql, [data.idUser, data.text, data.ip]).then(
      () => {
        return data.text
      },
      (err: MysqlError) => {
        logger.error('Ошибка запроса к бд: ', err)
        throw new DBError()
      }
    )
  }

  // Получить пользователя по токену
  getUserByToken = (token: string): Promise<User | null> => {
    const sql = `SELECT id_user AS id
                     FROM token
                     WHERE text = ?`
    return this.pool.query(sql, [token]).then(
      ([r]: any) => {
        return r[0] || null
      },
      (err: MysqlError) => {
        logger.error('Ошибка запроса к бд: ', err)
        throw new DBError()
      }
    )
  }

  // Получить пользователя с правами по токену
  getUserWithRightsByToken = (token: string): Promise<User | null> => {
    const sql = `select t.id_user as id, p.name
                     from token t
                              left join ar_user_role aur on t.id_user = aur.id_user
                              left join ar_role_permission arp on aur.id_role = arp.id_role
                              left join ar_permission p on p.id = arp.id_permission
                     where t.text = ?`
    return this.pool.query(sql, [token]).then(
      ([r]: any) => {
        if (!r) {
          return null
        }
        const user = new User()
        user.id = r[0].id
        if (r[0].name) {
          user.rights = r.map((el: any) => el.name)
        }
        return user
      },
      (err: MysqlError) => {
        logger.error('Ошибка запроса к бд: ', err)
        throw new DBError()
      }
    )
  }

  // Получить пользователя по токену и паролю
  getUserByTokenAndPassword = (
    token: string,
    pass: string
  ): Promise<User | null> => {
    const sql = `select t.id_user as id, a.username
                     from token t
                              join user u on u.id = t.id_user
                              join account a on u.id_account = a.id
                     where t.text = ?
                       and a.sha_pass_hash = ?`
    return this.pool.query(sql, [token, pass]).then(
      ([r]: any) => {
        if (!r.length) {
          return null
        }
        return r[0]
      },
      (err: MysqlError) => {
        logger.error('Ошибка запроса к бд: ', err)
        throw new DBError()
      }
    )
  }

  // Получить username по токену
  getUsernameByToken = (token: string): Promise<string | null> => {
    const sql = `select a.username
                     from token t
                              join user u on t.id_user = u.id
                              join account a on u.id_account = a.id
                     where t.text = ?`
    return this.pool.query(sql, [token]).then(
      ([r]: any) => {
        if (!r.length) {
          return null
        }
        return r[0].username
      },
      (err: MysqlError) => {
        logger.error('Ошибка запроса к бд: ', err)
        throw new DBError()
      }
    )
  }

  // Выход
  logout = (token: string): Promise<void> => {
    const sql = `DELETE
                     FROM token
                     WHERE text = ?`
    return this.pool.query(sql, [token]).then(
      () => {
        return
      },
      (err: MysqlError) => {
        logger.error('Ошибка запроса к бд: ', err)
        throw new DBError()
      }
    )
  }
}

export default AuthRepository
