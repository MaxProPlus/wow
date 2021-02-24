import Repository from '../core/repository'
import {DBError} from '../errors'
import {logger} from '../modules/core'
import {MysqlError} from 'mysql'

class RightRepository extends Repository {
  selectRights = (idUser: number): Promise<string[]> => {
    const sql = `select p.name
                     from ar_permission p
                              join ar_role_permission arp on p.id = arp.id_permission
                              join ar_user_role aar on arp.id_role = aar.id_role
                     where aar.id_user = ?`
    return this.pool.query(sql, [idUser]).then(
      (r: any) => {
        return r[0].map((el: any) => el.name)
      },
      (err: MysqlError) => {
        logger.error('Ошибка запроса к бд: ', err)
        throw new DBError()
      }
    )
  }

  checkRight = (right: string, idUser: number): Promise<boolean> => {
    const sql = `select p.id
                     from ar_permission p
                              join ar_role_permission arp on p.id = arp.id_permission
                              join ar_user_role aar on arp.id_role = aar.id_role
                     where p.name = ?
                       AND aar.id_user = ?`
    return this.pool.query(sql, [right, idUser]).then(
      ([r]: [number[]]) => {
        return r.length > 0
      },
      (err: MysqlError) => {
        logger.error('Ошибка запроса к бд: ', err)
        throw new DBError()
      }
    )
  }
}

export default RightRepository
