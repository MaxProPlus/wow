import {CommentArticle} from '../../../server/src/common/entity/types'
import Api from './BasicApi'

class ArticleApi extends Api {

    // Создать новость
    create(c: FormData) {
        const url = '/api/articles'
        return this.postForm(url, c).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return r.results[0]
        })
    }

    // Получить новость по id
    getById(id: string) {
        const url = '/api/articles/' + id
        return this.get(url).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return r.results
        })
    }

    // Получить все новости
    getAll(data: any, limit: number, page: number) {
        let url = `/api/articles?limit=${limit}&page=${page}`
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

    // Редактирование новости
    update(id: string, c: FormData) {
        const url = `/api/articles/${id}`
        return this.putForm(url, c).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return r.results[0]
        })
    }

    // Удаление новости
    remove(id: string) {
        const url = `/api/articles/${id}`
        return this.delete(url).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return 1
        })
    }

    // Создать комментарий к новости
    addComment(comment: CommentArticle) {
        const url = '/api/articles/comments'
        return this.post(url, comment).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return Promise.resolve()
        })
    }

    // Получить комментарии к новости
    getComments(idArticle: string) {
        const url = '/api/articles/' + idArticle + '/comments'
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

export default ArticleApi