import {CommentStory} from '../../../server/src/common/entity/types'
import Api from './BasicApi'

class StoryApi extends Api {

    // Создать сюжет
    create(c: FormData) {
        const url = '/api/stories'
        return this.postForm(url, c).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return r.results[0]
        })
    }

    // Получить сюжет по id
    getById(id: string) {
        const url = '/api/stories/' + id
        return this.get(url).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return r.results
        })
    }

    // Получить все сюжеты
    getAll(limit: number, page: number, data?: any) {
        let url = `/api/stories?limit=${limit}&page=${page}`
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

    // Редактирование сюжеты
    update(id: string, c: FormData) {
        const url = `/api/stories/${id}`
        return this.putForm(url, c).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return r.results[0]
        })
    }

    // Создать комментарий
    addComment(comment: CommentStory) {
        const url = '/api/stories/comments'
        return this.post(url, comment).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return Promise.resolve()
        })
    }

    // Удаление сюжета
    remove(id: string) {
        const url = `/api/stories/${id}`
        return this.delete(url).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return 1
        })
    }

    // Получить комментарии
    getComments(idStory: string) {
        const url = '/api/stories/' + idStory + '/comments'
        return this.get(url).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return r.results
        })
    }

    // Удалить коментарий
    removeComment(id: number) {
        console.log(id)
    }
}

export default StoryApi