import Api from "./BasicApi"
import {Feedback} from "../../../server/src/common/entity/types"

class FeedbackApi extends Api{

    // Получить список администрации
    getAll = () => {
        const url = '/api/feedback'
        return this.get(url).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return r.results
        })
    }

    // Обновить список администрации
    update = (list: Feedback[]) => {
        const url = '/api/feedback'
        return this.post(url, list).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return
        })
    }
}

export default FeedbackApi