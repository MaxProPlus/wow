import {
  Character,
  CommentGuild,
  Guild,
  Report,
  Story,
} from '../common/entity/types'
import BasicMaterialRepository from './basicMaterial'
import {DBError, NotFoundError} from '../errors'
import {GuildNotFoundError} from '../providers/guild'
import {logger} from '../modules/core'
import {MysqlError, OkPacket} from 'mysql'

class GuildRepository extends BasicMaterialRepository {
  constructor(pool: any) {
    super(pool, 'guild')
  }

  // Создать гильдию
  insert = (guild: Guild): Promise<number> => {
    const {
      idUser,
      urlAvatar,
      title,
      gameTitle,
      ideology,
      shortDescription,
      description,
      rule,
      more,
      status,
      kit,
      closed,
      hidden,
      comment,
      style,
    } = guild
    const sql = `INSERT INTO guild (id_user, url_avatar, title, game_title, ideology, short_description,
                                        description, rule, more,
                                        status, kit, closed, hidden, comment, style)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    return this.pool
      .query(sql, [
        idUser,
        urlAvatar,
        title,
        gameTitle,
        ideology,
        shortDescription,
        description,
        rule,
        more,
        status,
        kit,
        closed,
        hidden,
        comment,
        style,
      ])
      .then(
        ([r]: [OkPacket]) => {
          return r.insertId
        },
        (err: MysqlError) => {
          logger.error('Ошибка запроса к бд: ', err)
          throw new DBError()
        }
      )
  }

  // Вставка в таблицу многие ко многим
  insertMember = (id: number, idLink: number): Promise<number> => {
    const sql = `INSERT INTO guild_to_character (id_guild, id_character)
                     VALUES (?, ?)`
    return this.pool.query(sql, [id, idLink]).then(
      ([r]: [OkPacket]) => {
        return r.insertId
      },
      (err: MysqlError) => {
        logger.error('Ошибка запроса к бд: ', err)
        throw new DBError()
      }
    )
  }

  // Получить гильдию по id
  selectById = (id: number): Promise<Guild> => {
    const sql = `select g.id,
                            id_user           as idUser,
                            u.nickname        as userNickname,
                            g.url_avatar      as urlAvatar,
                            created_at        as createdAt,
                            updated_at        as updatedAt,
                            title,
                            game_title        as gameTitle,
                            short_description as shortDescription,
                            ideology,
                            description,
                            rule,
                            more,
                            status,
                            kit,
                            closed,
                            hidden,
                            comment,
                            style
                     from guild g
                              join user u on g.id_user = u.id
                     where g.id = ?
                       and is_remove = 0`
    return this.pool.query(sql, [id]).then(
      ([r]: [Guild[]]) => {
        if (!r.length) {
          throw new GuildNotFoundError()
        }
        return r[0]
      },
      (err: MysqlError) => {
        logger.error('Ошибка запроса к бд: ', err)
        throw new DBError()
      }
    )
  }

  // Получить участников гильдии
  selectMembersById = (id: number): Promise<Character[]> => {
    const sql = `select link.id,
                            link.url_avatar as urlAvatar,
                            link.title
                     from \`character\` link
                              join guild_to_character gtc on link.id = gtc.id_character
                              join guild g on gtc.id_guild = g.id
                     where g.id = ?
                       and link.is_remove = 0`
    return this.pool.query(sql, [id]).then(
      ([r]: [Character[]]) => {
        return r
      },
      (err: MysqlError) => {
        logger.error('Ошибка запроса к бд: ', err)
        throw new DBError()
      }
    )
  }

  // Получить сюжеты гильдии
  selectStoresById = (id: number): Promise<Story[]> => {
    const sql = `select link.id,
                            link.title,
                            link.hidden
                     from story link
                              join story_to_guild stg on link.id = stg.id_story
                              join guild c on stg.id_guild = c.id
                     where c.id = ?
                       and link.is_remove = 0`
    return this.pool.query(sql, [id]).then(
      ([r]: [Story[]]) => {
        return r
      },
      (err: MysqlError) => {
        logger.error('Ошибка запроса к бд: ', err)
        throw new DBError()
      }
    )
  }

  // Получить отчеты гильдии
  selectReportsById = (id: number): Promise<Report[]> => {
    const sql = `select link.id,
                            link.title,
                            link.hidden
                     from report link
                              join report_to_guild rtg on link.id = rtg.id_report
                              join guild c on rtg.id_guild = c.id
                     where c.id = ?
                       and link.is_remove = 0`
    return this.pool.query(sql, [id]).then(
      ([r]: [Report[]]) => {
        return r
      },
      (err: MysqlError) => {
        logger.error('Ошибка запроса к бд: ', err)
        throw new DBError()
      }
    )
  }

  // Получить все гильдии
  selectAll = (limit: number, page: number, data?: any): Promise<Guild[]> => {
    let sql = `select id,
                          id_user           as idUser,
                          url_avatar        as urlAvatar,
                          title,
                          short_description as shortDescription
                   from guild
                   where closed = 0
                     and is_remove = 0`
    const {where, sqlWhere} = this.genConditionAnd(data)
    sql += sqlWhere
    sql += ` order by id desc
        limit ? offset ?`
    return this.pool.query(sql, [...where, limit, limit * (page - 1)]).then(
      ([r]: [Guild[]]) => {
        return r
      },
      (err: MysqlError) => {
        logger.error('Ошибка запроса к бд: ', err)
        throw new DBError()
      }
    )
  }

  // Получить количество гильдий по запросу
  selectCount = (data?: any): Promise<number> => {
    let sql = `select count(id) as count
                   from guild
                   where closed = 0
                     and is_remove = 0`
    const {where, sqlWhere} = this.genConditionAnd(data)
    sql += sqlWhere
    return this.pool.query(sql, where).then(
      ([r]: any) => {
        return r[0].count
      },
      (err: MysqlError) => {
        logger.error('Ошибка запроса к бд: ', err)
        throw new DBError()
      }
    )
  }

  // Редактировать гильдию
  update = (guild: Guild): Promise<number> => {
    const {
      id,
      urlAvatar,
      title,
      gameTitle,
      shortDescription,
      ideology,
      description,
      rule,
      more,
      status,
      kit,
      closed,
      hidden,
      comment,
      style,
    } = guild
    const sql = `UPDATE guild
                     SET url_avatar        = ?,
                         updated_at        = current_timestamp(),
                         title             = ?,
                         game_title        = ?,
                         short_description = ?,
                         ideology          = ?,
                         description       = ?,
                         rule              = ?,
                         more              = ?,
                         status            = ?,
                         kit               = ?,
                         closed            = ?,
                         hidden            = ?,
                         comment           = ?,
                         style             = ?
                     where id = ?
                       and is_remove = 0`
    return this.pool
      .query(sql, [
        urlAvatar,
        title,
        gameTitle,
        shortDescription,
        ideology,
        description,
        rule,
        more,
        status,
        kit,
        closed,
        hidden,
        comment,
        style,
        id,
      ])
      .then(
        ([r]: [OkPacket]) => {
          if (!r.affectedRows) {
            throw new GuildNotFoundError()
          }
          return guild.id
        },
        (err: MysqlError) => {
          logger.error('Ошибка запроса к бд: ', err)
          throw new DBError()
        }
      )
  }

  // Удалить гильдию
  remove = (id: number): Promise<number> => {
    const sql = `UPDATE guild
                     SET is_remove = 1
                     where id = ?`
    return this.pool.query(sql, [id]).then(
      ([r]: [OkPacket]) => {
        if (!r.affectedRows) {
          throw new GuildNotFoundError()
        }
        return id
      },
      (err: MysqlError) => {
        logger.error('Ошибка запроса к бд: ', err)
        throw new DBError()
      }
    )
  }

  // Удалить участника из гильдии
  removeMember = (id: number, idLink: number): Promise<number> => {
    const sql = `delete
                     from guild_to_character
                     where id_guild = ?
                       and id_character = ?`
    return this.pool.query(sql, [id, idLink]).then(
      ([r]: [OkPacket]) => {
        if (!r.affectedRows) {
          throw new NotFoundError('Связь не найдена')
        }
        return id
      },
      (err: MysqlError) => {
        logger.error('Ошибка запроса к бд: ', err)
        throw new DBError()
      }
    )
  }

  // Создать комментарий
  insertComment = (comment: CommentGuild): Promise<number> => {
    const sql = `INSERT INTO guild_comment (text, id_user, id_guild)
                     VALUES (?, ?, ?)`
    return this.pool
      .query(sql, [comment.text, comment.idUser, comment.idGuild])
      .then(
        ([r]: [OkPacket]) => {
          return r.insertId
        },
        (err: MysqlError) => {
          logger.error('Ошибка запроса к бд: ', err)
          throw new DBError()
        }
      )
  }

  // Получить комментарий по id
  selectCommentById = (id: number): Promise<CommentGuild> => {
    const sql = `select c.id,
                            c.text,
                            c.id_user  as idUser,
                            c.id_guild as idGuild
                     from guild_comment c
                     where c.id = ?
                       and c.is_remove = 0`
    return this.pool.query(sql, [id]).then(
      ([r]: [CommentGuild[]]) => {
        if (!r.length) {
          throw new NotFoundError('Комментарий не найден')
        }
        return r[0]
      },
      (err: MysqlError) => {
        logger.error('Ошибка запроса к бд: ', err)
        throw new DBError()
      }
    )
  }

  // Получить комментарии
  selectCommentsByIdGuild = (id: number): Promise<CommentGuild[]> => {
    const sql = `select c.id,
                            c.text,
                            c.id_user    as idUser,
                            c.id_guild   as idGuild,
                            c.created_at as createdAt,
                            c.updated_at as updatedAt,
                            u.nickname   as authorNickname,
                            u.url_avatar as authorUrlAvatar
                     from guild_comment c
                              join user u on c.id_user = u.id
                     where c.id_guild = ?
                       and c.is_remove = 0`
    return this.pool.query(sql, [id]).then(
      ([r]: [CommentGuild[]]) => {
        return r
      },
      (err: MysqlError) => {
        logger.error('Ошибка запроса к бд: ', err)
        throw new DBError()
      }
    )
  }

  // Удалить комментарий
  removeComment = (id: number): Promise<number> => {
    const sql = `UPDATE guild_comment
                     SET is_remove = 1
                     where id = ?`
    return this.pool.query(sql, [id]).then(
      ([r]: [OkPacket]) => {
        if (!r.affectedRows) {
          throw new NotFoundError('Комментарий не найден')
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

export default GuildRepository
