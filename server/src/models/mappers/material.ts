import BasicMapper from './mapper'
import logger from '../../services/logger'
import {User} from '../../common/entity/types'

// Базовый класс для материалов с соавторами
// Работает с таблицей table_coauthor, где table задает конструктором
class BasicMaterialMapper extends BasicMapper {
    private readonly table: string // название таблицы

    constructor(pool: any, table: string) {
        super(pool)
        this.table = table
    }

    // Добавить соавтора
    insertCoauthor = (id: number, idUser: number) => {
        const sql = `INSERT INTO ${this.table}_coauthor (id_${this.table}, id_user)
                     VALUES (?, ?)`
        return this.pool.query(sql, [id, idUser]).then(([r]: any) => {
            return Promise.resolve(r.insertId)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить список соавторов
    selectCoauthorById = (id: number): Promise<User[]> => {
        const sql = `select link.id, link.nickname 
                     from account link
                              join ${this.table}_coauthor tc on link.id = tc.id_user
                              join \`${this.table}\` s on tc.id_${this.table} = s.id
                     where s.id = ?`
        return this.pool.query(sql, [id]).then(([r]: [User[]]) => {
            return Promise.resolve(r)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Удалить соавтора
    removeCoauthor = (id: number, idLink: number) => {
        const sql = `delete
                     from ${this.table}_coauthor
                     where id_${this.table} = ?
                       and id_user = ?`
        return this.pool.query(sql, [id, idLink]).then((r: any) => {
            if (!r[0].affectedRows) {
                return Promise.reject('Связь не найдена')
            }
            return Promise.resolve(id)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

}

export default BasicMaterialMapper