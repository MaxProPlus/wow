import {CommentGuild} from "../../../server/src/common/entity/types"
import Api from "./basicApi"

class GuildApi extends Api {

    // Создать гильдию
    create(c: FormData) {
        const url = '/api/guilds'
        return this.postForm(url, c).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return r.results[0]
        })
    }

    // Получить гильдию по id
    getById(id: string) {
        const url = '/api/guilds/' + id
        return this.get(url).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return r.results
        })
    }

    // Получить все гильдии
    getAll(limit: number, page: number) {
        const url = `/api/guilds?limit=${limit}&page=${page}`
        return this.get(url).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return r.results
        })
    }

    // Редактирование гильдии
    update(id: string, c: FormData) {
        const url = `/api/guilds/${id}`
        return this.putForm(url, c).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return r.results[0]
        })
    }

    // Создать комментарий
    addComment(comment: CommentGuild) {
        const url = '/api/guilds/comments'
        return this.post(url, comment).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return Promise.resolve()
        })
    }

    // Получить комментарии
    getComments(idCharacter: string) {
        const url = '/api/guilds/' + idCharacter + '/comments'
        return this.get(url).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return r.results
        })
    }

    // Удалить коментарий
    removeComment(id: number) {

    }
}

export default GuildApi