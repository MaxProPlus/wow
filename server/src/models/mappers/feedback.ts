import BasicMapper from './mapper'
import {Feedback} from '../../common/entity/types'
import logger from '../../services/logger'

class FeedbackMapper extends BasicMapper {

    insert = (feedback: Feedback) => {
        const {idUser, role} = feedback
        const sql = `INSERT INTO feedback (id_user, role)
                     VALUES (?, ?)`
        return this.pool.query(sql, [idUser, role]).then(([r]: any) => {
            return Promise.resolve(r.insertId)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    selectAll = (): Promise<Feedback[]> => {
        const sql = `select f.id,
                            f.role,
                            u.id as idUser,
                            u.url_avatar as urlAvatar,
                            u.nickname,
                            u.link_ds    as linkDs,
                            u.link_mail  as linkMail,
                            u.link_vk    as linkVk,
                            u.link_tg    as linkTg
                     from user u
                              join feedback f on u.id = f.id_user`
        return this.pool.query(sql).then(([r]: [Feedback[]]) => {
            return Promise.resolve(r)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    update = (feedback: Feedback) => {
        const {idUser, role} = feedback
        const sql = `update feedback
                     set role = ?
                     where id_user = ?`
        return this.pool.query(sql, [role, idUser]).then((r: any) => {
            if (!r[0].affectedRows) {
                return Promise.reject('Пользователь не найден')
            }
            return Promise.resolve(idUser)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    remove = (id: number) => {
        const sql = `delete
                     from feedback
                     where id = ?`
        return this.pool.query(sql, [id]).then(([r]: any) => {
            return Promise.resolve(id)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }
}

export default FeedbackMapper