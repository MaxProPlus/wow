import FeedbackMapper from '../mappers/feedback'
import {DB} from '../../services/mysql'
import {Request, Response} from 'express'
import {Feedback} from '../../common/entity/types'
import {defaultAvatar} from '../../entity/types'

class FeedbackModel {
    private mapper: FeedbackMapper
    constructor(conn: DB) {
        this.mapper = new FeedbackMapper(conn.getPoolPromise())
    }

    getAll = () => {
        return this.mapper.selectAll().then(r=>{
            r.forEach(el=>{
                if (!el.urlAvatar) {
                    el.urlAvatar = defaultAvatar
                }
            })
            return r
        })
    }

    update = async (list: Feedback[]) => {
        const oldList = await this.getAll()

        // Перебираем новый список
        await Promise.all(list.map((el)=>{
            const findIndex = oldList.findIndex((oldEl) => oldEl.idUser === el.idUser)

            // Если не находим, то добавляем
            if (findIndex === -1) {
                return this.mapper.insert(el)
            } else {
                // Если нашли, сравниваем нужно ли обновить
                if (oldList[findIndex].role !== el.role) {
                    return this.mapper.update(el)
                }
            }
        }))

        // Перебираем старый список
        return Promise.all(oldList.map((el)=>{
            // Если не находим, то удаляем
            if (list.findIndex((newEl) => newEl.idUser === el.idUser) === -1) {
                return this.mapper.remove(el.id)
            }
        }))
    }
}

export default FeedbackModel