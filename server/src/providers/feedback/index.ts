import FeedbackRepository from '../../repositories/feedback'
import {Feedback} from '../../common/entity/types'
import {defaultAvatar} from '../../entity/types'

class FeedbackProvider {
    constructor(
        private repository: FeedbackRepository
    ) {
    }

    getAll = () => {
        return this.repository.selectAll().then(r => {
            r.forEach(el => {
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
        await Promise.all(list.map((el) => {
            const findIndex = oldList.findIndex((oldEl) => oldEl.idUser === el.idUser)

            // Если не находим, то добавляем
            if (findIndex === -1) {
                return this.repository.insert(el)
            } else {
                // Если нашли, сравниваем нужно ли обновить
                if (oldList[findIndex].role !== el.role) {
                    return this.repository.update(el)
                }
            }
        }))

        // Перебираем старый список
        return Promise.all(oldList.map((el) => {
            // Если не находим, то удаляем
            if (list.findIndex((newEl) => newEl.idUser === el.idUser) === -1) {
                return this.repository.remove(el.id)
            }
        }))
    }
}

export default FeedbackProvider