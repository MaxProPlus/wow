import Repository from '../core/repository'
import {DBError} from '../errors'
import {logger} from '../modules/core'
import {MysqlError} from 'mysql'

class MaterialRepository extends Repository {
  // Получить список
  selectAll = (limit: number, page: number, data?: any): Promise<any[]> => {
    const title = `%${data.title}%`
    const sql = `
            select *
            from (
                     select 'character' as href, id, title, url_avatar as urlAvatar
                     from \`character\`
                     where hidden = 0
                       and closed = 0
                       and is_remove = 0
                       and title like ?
                     union all
                     select 'guild' as href, id, title, url_avatar as urlAvatar
                     from guild
                     where hidden = 0
                       and closed = 0
                       and is_remove = 0
                       and title like ?
                     union all
                     select 'story' as href, id, title, url_avatar as urlAvatar
                     from story
                     where hidden = 0
                       and closed = 0
                       and is_remove = 0
                       and title like ?
                     union all
                     select 'report' as href, id, title, url_avatar as urlAvatar
                     from report
                     where hidden = 0
                       and closed = 0
                       and is_remove = 0
                       and title like ?) X
            order by id desc
            limit ? offset ?`
    return this.pool
      .query(sql, [title, title, title, title, limit, limit * (page - 1)])
      .then(
        ([r]: [any[]]) => {
          return r
        },
        (err: MysqlError) => {
          logger.error('Ошибка запроса к бд: ', err)
          throw new DBError()
        }
      )
  }

  // Получить количество материалов
  selectCount = (data?: any): Promise<number> => {
    const title = `%${data.title}%`
    const sql = `select count(id) as count
                     from (
                              select 'characters' as href, id, title, url_avatar as urlAvatar
                              from \`character\`
                              where hidden = 0
                                and closed = 0
                                and is_remove = 0
                                and title like ?
                              union all
                              select 'guilds' as href, id, title, url_avatar as urlAvatar
                              from guild
                              where hidden = 0
                                and closed = 0
                                and is_remove = 0
                                and title like ?
                              union all
                              select 'stories' as href, id, title, url_avatar as urlAvatar
                              from story
                              where hidden = 0
                                and closed = 0
                                and is_remove = 0
                                and title like ?
                              union all
                              select 'reports' as href, id, title, url_avatar as urlAvatar
                              from report
                              where hidden = 0
                                and closed = 0
                                and is_remove = 0
                                and title like ?) X`
    return this.pool.query(sql, [title, title, title, title]).then(
      ([r]: any) => {
        return r[0].count
      },
      (err: MysqlError) => {
        logger.error('Ошибка запроса к бд: ', err)
        throw new DBError()
      }
    )
  }
}

export default MaterialRepository
