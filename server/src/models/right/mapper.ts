import logger from '../../services/logger'

class Mapper {
    private pool: any

    constructor(pool: any) {
        this.pool = pool
    }

    selectRights = (idAccount: number) => {
        const sql = `select p.name
                     from ar_permission p
                              join ar_role_permission arp on p.id = arp.id_permission
                              join ar_account_role aar on arp.id_role = aar.id_role
                     where aar.id_account = ?`
        return this.pool.query(sql, [idAccount]).then((r: any) => {
            return Promise.resolve(r[0].map((el: any) => el.name))
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    checkRight = (right: string, idAccount: number): Promise<boolean> => {
        const sql = `select p.id
                     from ar_permission p
                              join ar_role_permission arp on p.id = arp.id_permission
                              join ar_account_role aar on arp.id_role = aar.id_role
                     where p.name = ?
                       AND aar.id_account = ?`
        return this.pool.query(sql, [right, idAccount]).then((r: any) => {
            if (r[0].length > 0) {
                return Promise.resolve(true)
            }
            return Promise.resolve(false)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }
}

export default Mapper
