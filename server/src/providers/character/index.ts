import CharacterRepository from '../../repositories/character'
import {
  Character,
  CommentCharacter,
  Guild,
  Report,
  Story,
  User,
} from '../../common/entity/types'
import {CharacterUpload} from '../../entity/types'
import Uploader from '../../services/uploader'
import {ForbiddenError, NotFoundError} from '../../errors'

// Ошибка "Персонаж не найден"
export class CharacterNotFoundError extends NotFoundError {
  constructor(message = 'Персонаж не найден') {
    super(message)
  }
}

class CharacterProvider {
  constructor(
    private repository: CharacterRepository,
    private uploader: Uploader
  ) {}

  // Создать персонажа
  create = async (c: CharacterUpload) => {
    c.urlAvatar = await this.uploader.move(c.fileAvatar, 'characterAvatar')

    const id = await this.repository.insert(c)
    const p: Promise<any>[] = []
    p.push(
      Promise.all(
        c.friends.map((idLink) => {
          return this.repository.insertLink(id, idLink)
        })
      )
    )
    p.push(
      Promise.all(
        c.coauthors.map((el: number) => {
          return this.repository.insertCoauthor(id, el)
        })
      )
    )
    await Promise.all(p)
    return id
  }

  // Получить персонажа по id
  getById = (id: number): Promise<[Character, CommentCharacter[]]> => {
    const p = [
      this.repository.selectById(id),
      this.repository.selectByIdLink(id),
      this.repository.selectGuildsById(id),
      this.repository.selectStoresById(id),
      this.repository.selectReportsById(id),
      this.repository.selectCoauthorById(id),
      this.getComments(id),
    ]
    return Promise.all<
      Character,
      Character[],
      Guild[],
      Story[],
      Report[],
      User[],
      CommentCharacter[]
    >(p as any).then(
      ([c, links, guilds, stores, reports, coauthors, comments]) => {
        c.friends = links
        c.guilds = guilds
        c.stores = stores
        c.reports = reports
        c.coauthors = coauthors
        return [c, comments]
      }
    )
  }

  // Получить всех персонажей
  getAll = (
    limit: number,
    page: number,
    data?: any
  ): Promise<{data: Character[]; count: number}> => {
    const p = []
    p.push(this.repository.selectAll(limit, page, data))
    p.push(this.repository.selectCount(data))
    return Promise.all<any>(p).then((r) => {
      return {
        data: r[0],
        count: r[1],
      }
    })
  }

  // Редактировать персонажа
  update = async (c: CharacterUpload): Promise<number> => {
    const oldCharacter = await this.repository.selectById(c.id)

    oldCharacter.coauthors = await this.repository.selectCoauthorById(c.id)
    if (
      oldCharacter.idUser !== c.idUser &&
      oldCharacter.coauthors.findIndex((el: User) => el.id === c.idUser) === -1
    ) {
      throw new ForbiddenError()
    }

    const p = []

    oldCharacter.friends = await this.repository.selectByIdLink(c.id)
    // Перебор нового списка друзей персонажей
    p.push(
      Promise.all(
        c.friends.map((el: number) => {
          // Если не находим в старом списке, то добавляем
          if (oldCharacter.friends.findIndex((o) => el === o.id) === -1) {
            return this.repository.insertLink(c.id, el)
          }
        })
      )
    )
    // Перебор старого списка друзей персонажей
    p.push(
      Promise.all(
        oldCharacter.friends.map((el: Character) => {
          // Если не находим в новом списке, то удаляем
          if (c.friends.indexOf(el.id) === -1) {
            return this.repository.removeLink(c.id, el.id)
          }
        })
      )
    )

    // Перебор нового списка соавторов
    p.push(
      Promise.all(
        c.coauthors.map((el: number) => {
          // Если не находим в старом списке, то добавляем
          if (oldCharacter.coauthors.findIndex((o) => el === o.id) === -1) {
            return this.repository.insertCoauthor(c.id, el)
          }
        })
      )
    )
    // Перебор старого списка соавторов
    p.push(
      Promise.all(
        oldCharacter.coauthors.map((el: User) => {
          // Если не находим в новом списке, то удаляем
          if (c.coauthors.indexOf(el.id) === -1) {
            return this.repository.removeCoauthor(c.id, el.id)
          }
        })
      )
    )

    c.urlAvatar = oldCharacter.urlAvatar
    // Если загружена новая аватарка, то обновляем ее
    if (c.fileAvatar) {
      this.uploader.remove(oldCharacter.urlAvatar)
      c.urlAvatar = await this.uploader.move(c.fileAvatar, 'characterAvatar')
    }
    await Promise.all<any>(p)

    return this.repository.update(c)
  }

  // Удалить персонажа
  remove = async (character: Character): Promise<number> => {
    const oldCharacter = await this.repository.selectById(character.id)
    if (oldCharacter.idUser !== character.idUser) {
      throw new ForbiddenError('Удалить может только владалец')
    }
    this.uploader.remove(oldCharacter.urlAvatar)
    return this.repository.remove(character.id)
  }

  // Создать комментарий к персонажу
  createComment = async (comment: CommentCharacter): Promise<number> => {
    const c = await this.repository.selectById(comment.idCharacter)
    if ((c.idUser !== comment.idUser) && (c.comment || c.closed)) {
      throw new ForbiddenError('Комментирование запрещено')
    }
    return this.repository.insertComment(comment)
  }

  // Получить комментарии к персонажу
  getComments = (id: number): Promise<CommentCharacter[]> => {
    return this.repository.selectCommentsByIdCharacter(id)
  }

  // Удалить комментарий
  removeComment = async (
    comment: CommentCharacter,
    right: boolean
  ): Promise<number> => {
    const oldComment = await this.repository.selectCommentById(comment.id)
    const character = await this.repository.selectById(oldComment.idCharacter)
    if (
      oldComment.idUser === comment.idUser ||
      comment.idUser === character.idUser ||
      right
    ) {
      return this.repository.removeComment(comment.id)
    }
    throw new ForbiddenError()
  }
}

export default CharacterProvider
