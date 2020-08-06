import {Comment} from "../../../server/src/common/entity/types"
import Api from "./basicApi";

class CharacterApi extends Api {

    // Создать персонажа
    create(c: FormData) {
        const url = '/api/characters'
        return this.postForm(url, c).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return r.results[0]
        })
    }

    // Получить персонажа по id
    getById(id: string) {
        const url = '/api/characters/' + id
        return this.get(url).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return r.results
        })
    }

    // Получить всех персонажей
    getAll(limit: number, page: number) {
        const url = `/api/characters?limit=${limit}&page=${page}`
        return this.get(url).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return r.results
        })
    }

    // Создать комментарий к персонажу
    addComment(comment: Comment) {
        const url = '/api/tickets/comments'
        return this.post(url, comment).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return Promise.resolve()
        })
    }

    // Получить комментарии к персонажу
    getComments(idTicket: string) {
        const url = '/api/tickets/' + idTicket + '/comments'
        return this.get(url).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return r.results
        })
    }

    removeCommnet(id: number) {

    }
}

export default CharacterApi