import Repository from '../core/repository'
import {Feedback} from '../common/entity/types'
import logger from '../services/logger'
import {DBError, NotFoundError} from '../errors'

class FeedbackRepository extends Repository {

    // Добавить пользователя в список администраторов
    insert = (feedback: Feedback): Promise<number> => {
        const {idUser, role} = feedback
        const sql = `INSERT INTO feedback (id_user, role)
                     VALUES (?, ?)`
        return this.pool.query(sql, [idUser, role]).then(([r]: any) => {
            return r.insertId
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Получить список администраторов
    selectAll = (): Promise<Feedback[]> => {
        const sql = `select f.id,
                            f.role,
                            u.id         as idUser,
                            u.url_avatar as urlAvatar,
                            u.nickname,
                            u.link_ds    as linkDs,
                            u.link_mail  as linkMail,
                            u.link_vk    as linkVk,
                            u.link_tg    as linkTg
                     from user u
                              join feedback f on u.id = f.id_user`
        return this.pool.query(sql).then(([r]: [Feedback[]]) => {
            return r
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Обновить название роли у пользователя
    update = (feedback: Feedback): Promise<number> => {
        const {idUser, role} = feedback
        const sql = `update feedback
                     set role = ?
                     where id_user = ?`
        return this.pool.query(sql, [role, idUser]).then((r: any) => {
            if (!r[0].affectedRows) {
                throw new NotFoundError('Пользователь не найден')
            }
            return idUser
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }

    // Удалить пользователя из списка администраторов
    remove = (id: number): Promise<number> => {
        const sql = `delete
                     from feedback
                     where id = ?`
        return this.pool.query(sql, [id]).then(() => {
            return id
        }, (err: Error) => {
            logger.error('Ошибка запроса к бд: ', err)
            throw new DBError()
        })
    }
}

export default FeedbackRepository