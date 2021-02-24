import {CommentCharacter} from '../../../server/src/common/entity/types'
import Api from './BasicApi'

class CharacterApi extends Api {
  // Создать персонажа
  create(c: FormData) {
    const url = '/api/characters'
    return this.postForm(url, c).then((r) => {
      if (r.status !== 'OK') return Promise.reject(r.errorMessage)
      return r.results[0]
    })
  }

  // Получить персонажа по id
  getById(id: string) {
    const url = '/api/characters/' + id
    return this.get(url).then((r) => {
      if (r.status !== 'OK') return Promise.reject(r.errorMessage)
      return r.results
    })
  }

  // Получить всех персонажей
  getAll(limit: number, page: number, data?: any) {
    let url = `/api/characters?limit=${limit}&page=${page}`
    if (!!data) {
      for (let key in data) {
        url += `&${key}=${data[key]}`
      }
    }
    return this.get(url).then((r) => {
      if (r.status !== 'OK') return Promise.reject(r.errorMessage)
      return r.results
    })
  }

  // Редактирование персонажа
  update(id: string, c: FormData) {
    const url = `/api/characters/${id}`
    return this.putForm(url, c).then((r) => {
      if (r.status !== 'OK') return Promise.reject(r.errorMessage)
      return r.results[0]
    })
  }

  // Удаление персонажа
  remove(id: string) {
    const url = `/api/characters/${id}`
    return this.delete(url).then((r) => {
      if (r.status !== 'OK') return Promise.reject(r.errorMessage)
      return 1
    })
  }

  // Создать комментарий к персонажу
  addComment(comment: CommentCharacter) {
    const url = '/api/characters/comments'
    return this.post(url, comment).then((r) => {
      if (r.status !== 'OK') return Promise.reject(r.errorMessage)
      return Promise.resolve()
    })
  }

  // Получить комментарии к персонажу
  getComments(idCharacter: string) {
    const url = '/api/characters/' + idCharacter + '/comments'
    return this.get(url).then((r) => {
      if (r.status !== 'OK') return Promise.reject(r.errorMessage)
      return r.results
    })
  }

  removeComment(id: number) {
    console.log(id)
  }
}

export default CharacterApi
