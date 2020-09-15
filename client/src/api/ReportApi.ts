import {CommentReport} from "../../../server/src/common/entity/types"
import Api from "./BasicApi"

class ReportApi extends Api {

    // Создать отчет
    create(c: FormData) {
        const url = '/api/reports'
        return this.postForm(url, c).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return r.results[0]
        })
    }

    // Получить отчет по id
    getById(id: string) {
        const url = '/api/reports/' + id
        return this.get(url).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return r.results
        })
    }

    // Получить все отчеты
    getAll(data: any, limit: number, page: number) {
        let url = `/api/reports?limit=${limit}&page=${page}`
        if (!!data) {
            for (let key in data) {
                url += `&${key}=${data[key]}`
            }
        }
        return this.get(url).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return r.results
        })
    }

    // Редактирование отчета
    update(id: string, c: FormData) {
        const url = `/api/reports/${id}`
        return this.putForm(url, c).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return r.results[0]
        })
    }

    // Удаление отчета
    remove(id: string) {
        const url = `/api/reports/${id}`
        return this.delete(url).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return 1
        })
    }

    // Создать комментарий к отчету
    addComment(comment: CommentReport) {
        const url = '/api/reports/comments'
        return this.post(url, comment).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return Promise.resolve()
        })
    }

    // Получить комментарии к отчету
    getComments(idReport: string) {
        const url = '/api/reports/' + idReport + '/comments'
        return this.get(url).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return r.results
        })
    }

    removeComment(id: number) {
        console.log(id)
    }
}

export default ReportApi