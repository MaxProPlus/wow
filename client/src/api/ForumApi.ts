import {CommentForum} from '../../../server/src/common/entity/types'
import Api from './BasicApi'

class ForumApi extends Api {

    // Создать формум
    create(c: FormData) {
        const url = '/api/forums'
        return this.postForm(url, c).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return r.results[0]
        })
    }

    // Получить формум по id
    getById(id: string) {
        const url = '/api/forums/' + id
        return this.get(url).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return r.results
        })
    }

    // Получить все формумы
    getAll(data: any, limit: number, page: number) {
        let url = `/api/forums?limit=${limit}&page=${page}`
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

    // Редактирование формума
    update(id: string, c: FormData) {
        const url = `/api/forums/${id}`
        return this.putForm(url, c).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return r.results[0]
        })
    }

    // Удаление формума
    remove(id: string) {
        const url = `/api/forums/${id}`
        return this.delete(url).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return 1
        })
    }

    // Создать комментарий к формуму
    addComment(comment: CommentForum) {
        const url = '/api/forums/comments'
        return this.post(url, comment).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return Promise.resolve()
        })
    }

    // Получить комментарии к формуму
    getComments(idForum: string) {
        const url = '/api/forums/' + idForum + '/comments'
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

export default ForumApi