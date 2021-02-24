import Repository from '../core/repository'
import {User} from '../common/entity/types'
import {DBError, NotFoundError} from '../errors'
import {logger} from '../modules/core'
import {MysqlError, OkPacket} from 'mysql'

// Базовый класс для материалов с соавторами
// Работает с таблицей table_coauthor, где table задает конструктором
class BasicMaterialRepository extends Repository {
  private readonly table: string // название таблицы

  constructor(pool: any, table: string) {
    super(pool)
    this.table = table
  }

  // Добавить соавтора
  insertCoauthor = (id: number, idUser: number): Promise<number> => {
    const sql = `INSERT INTO ${this.table}_coauthor (id_${this.table}, id_user)
                     VALUES (?, ?)`
    return this.pool.query(sql, [id, idUser]).then(
      ([r]: [OkPacket]) => {
        return r.insertId
      },
      (err: MysqlError) => {
        logger.error('Ошибка запроса к бд: ', err)
        throw new DBError()
      }
    )
  }

  // Получить список соавторов
  selectCoauthorById = (id: number): Promise<User[]> => {
    const sql = `select link.id, link.nickname 
                     from user link
                              join ${this.table}_coauthor tc on link.id = tc.id_user
                              join \`${this.table}\` s on tc.id_${this.table} = s.id
                     where s.id = ?`
    return this.pool.query(sql, [id]).then(
      ([r]: [User[]]) => {
        return r
      },
      (err: any) => {
        logger.error('Ошибка запроса к бд: ', err)
        throw new DBError()
      }
    )
  }

  // Удалить соавтора
  removeCoauthor = (id: number, idLink: number): Promise<number> => {
    const sql = `delete
                     from ${this.table}_coauthor
                     where id_${this.table} = ?
                       and id_user = ?`
    return this.pool.query(sql, [id, idLink]).then(
      ([r]: [OkPacket]) => {
        if (!r.affectedRows) {
          throw new NotFoundError('Соавтор не найден')
        }
        return id
      },
      (err: MysqlError) => {
        logger.error('Ошибка запроса к бд: ', err)
        throw new DBError()
      }
    )
  }
}

export default BasicMaterialRepository
