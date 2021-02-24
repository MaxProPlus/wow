import ReportRepository from '../../repositories/report'
import {
  Character,
  CommentReport,
  Guild,
  Report,
  Story,
  User,
} from '../../common/entity/types'
import {defaultAvatar, ReportUpload} from '../../entity/types'
import Uploader from '../../services/uploader'
import RightProvider from '../right'
import {ForbiddenError, NotFoundError} from '../../errors'

// Ошибка "Отчет / лог не найден"
export class ReportNotFoundError extends NotFoundError {
  constructor() {
    super('Отчет / лог не найден')
  }
}

class ReportProvider {
  constructor(
    private repository: ReportRepository,
    private rightProvider: RightProvider,
    private uploader: Uploader
  ) {}

  // Создать отчет
  create = async (c: ReportUpload): Promise<number> => {
    const infoAvatar = this.uploader.getInfo(c.fileAvatar, 'reportAvatar')
    c.urlAvatar = infoAvatar.url

    const id = await this.repository.insert(c)
    const p: Promise<any>[] = []
    p.push(
      Promise.all(
        c.members.map((idLink) => {
          return this.repository.insertMember(id, idLink)
        })
      )
    )
    p.push(
      Promise.all(
        c.guilds.map((idLink) => {
          return this.repository.insertGuild(id, idLink)
        })
      )
    )
    p.push(
      Promise.all(
        c.stores.map((idLink) => {
          return this.repository.insertStory(id, idLink)
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
    p.push(c.fileAvatar.mv(infoAvatar.path))
    await Promise.all(p)
    return id
  }

  // Получить отчет по id
  getById = (id: number): Promise<[Report, CommentReport[]]> => {
    const p: [
      Promise<Report>,
      Promise<Character[]>,
      Promise<Guild[]>,
      Promise<Story[]>,
      Promise<User[]>,
      Promise<CommentReport[]>
    ] = [
      this.repository.selectById(id),
      this.repository.selectMembersById(id),
      this.repository.selectGuildsById(id),
      this.repository.selectStoresById(id),
      this.repository.selectCoauthorById(id),
      this.getComments(id),
    ]
    return Promise.all<
      Report,
      Character[],
      Guild[],
      Story[],
      User[],
      CommentReport[]
    >(p).then(([s, members, guilds, stores, coauthors, comments]) => {
      s.members = members
      s.guilds = guilds
      s.stores = stores
      s.coauthors = coauthors
      return [s, comments]
    })
  }

  // Получить все отчеты
  getAll = (
    limit: number,
    page: number,
    data?: any
  ): Promise<{data: Report[]; count: number}> => {
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

  // Редактировать отчет
  update = async (c: ReportUpload): Promise<number> => {
    const old = await this.repository.selectById(c.id)
    old.coauthors = await this.repository.selectCoauthorById(c.id)
    if (
      old.idUser !== c.idUser &&
      old.coauthors.findIndex((el: User) => el.id === c.idUser) === -1
    ) {
      throw new ForbiddenError()
    }

    const p = []

    old.members = await this.repository.selectMembersById(c.id)
    // Перебор нового списка участников отчета
    p.push(
      Promise.all(
        c.members.map((el: number) => {
          // Если не находим в старом списке, то добавляем
          if (old.members.findIndex((o) => el === o.id) === -1) {
            return this.repository.insertMember(c.id, el)
          }
        })
      )
    )
    // Перебор старого списка участников отчета
    p.push(
      Promise.all(
        old.members.map((el: Character) => {
          // Если не находим в новом списке, то удаляем
          if (c.members.indexOf(el.id) === -1) {
            return this.repository.removeMember(c.id, el.id)
          }
        })
      )
    )

    old.guilds = await this.repository.selectGuildsById(c.id)
    // Перебор нового списка гильдий отчета
    p.push(
      Promise.all(
        c.guilds.map((el: number) => {
          // Если не находим в старом списке, то добавляем
          if (old.guilds.findIndex((o) => el === o.id) === -1) {
            return this.repository.insertGuild(c.id, el)
          }
        })
      )
    )
    // Перебор старого списка гильдий отчета
    p.push(
      Promise.all(
        old.guilds.map((el: Character) => {
          // Если не находим в новом списке, то удаляем
          if (c.guilds.indexOf(el.id) === -1) {
            return this.repository.removeGuild(c.id, el.id)
          }
        })
      )
    )

    old.stores = await this.repository.selectStoresById(c.id)
    // Перебор нового списка участников отчета
    p.push(
      Promise.all(
        c.stores.map((el: number) => {
          // Если не находим в старом списке, то добавляем
          if (old.stores.findIndex((o) => el === o.id) === -1) {
            return this.repository.insertStory(c.id, el)
          }
        })
      )
    )
    // Перебор старого списка участников отчета
    p.push(
      Promise.all(
        old.stores.map((el: Character) => {
          // Если не находим в новом списке, то удаляем
          if (c.stores.indexOf(el.id) === -1) {
            return this.repository.removeStory(c.id, el.id)
          }
        })
      )
    )

    // Перебор нового списка соавторов
    p.push(
      Promise.all(
        c.coauthors.map((el: number) => {
          // Если не находим в старом списке, то добавляем
          if (old.coauthors.findIndex((o) => el === o.id) === -1) {
            return this.repository.insertCoauthor(c.id, el)
          }
        })
      )
    )
    // Перебор старого списка соавторов
    p.push(
      Promise.all(
        old.coauthors.map((el: User) => {
          // Если не находим в новом списке, то удаляем
          if (c.coauthors.indexOf(el.id) === -1) {
            return this.repository.removeCoauthor(c.id, el.id)
          }
        })
      )
    )

    // Обновить аватарку
    c.urlAvatar = old.urlAvatar
    let infoAvatar
    if (c.fileAvatar) {
      this.uploader.remove(old.urlAvatar)
      infoAvatar = this.uploader.getInfo(c.fileAvatar, 'reportAvatar')
      c.urlAvatar = infoAvatar.url
      p.push(c.fileAvatar.mv(infoAvatar.path))
    }
    await Promise.all<any>(p)
    return this.repository.update(c)
  }

  // Удалить отчет
  remove = async (report: Report): Promise<number> => {
    const old = await this.repository.selectById(report.id)
    old.coauthors = await this.repository.selectCoauthorById(report.id)
    if (
      old.idUser !== report.idUser &&
      old.coauthors.findIndex((el: User) => el.id === report.idUser) === -1
    ) {
      throw new ForbiddenError()
    }
    this.uploader.remove(old.urlAvatar)
    return this.repository.remove(report.id)
  }

  // Создать комментарий
  createComment = async (comment: CommentReport): Promise<number> => {
    const c = await this.repository.selectById(comment.idReport)
    if (c.comment || (c.closed && c.idUser !== comment.idUser)) {
      throw new ForbiddenError('Комментирование запрещено')
    }
    return this.repository.insertComment(comment)
  }

  // Получить комментарии
  getComments = async (id: number): Promise<CommentReport[]> => {
    const comments = await this.repository.selectCommentsByIdReport(id)
    comments.forEach((c) => {
      if (!c.authorUrlAvatar) {
        c.authorUrlAvatar = defaultAvatar
      }
    })
    return comments
  }

  // Удалить комментарий
  removeComment = async (comment: CommentReport): Promise<number> => {
    const oldComment = await this.repository.selectCommentById(comment.id)
    const report = await this.repository.selectById(oldComment.idReport)
    if (
      oldComment.idUser === comment.idUser ||
      comment.idUser === report.idUser ||
      (await this.rightProvider.commentModerator(comment.idUser))
    ) {
      return this.repository.removeComment(comment.id)
    }
    throw new ForbiddenError()
  }
}

export default ReportProvider
