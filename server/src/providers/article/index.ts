import ArticleRepository from '../../repositories/article'
import {Article, CommentArticle} from '../../common/entity/types'
import {ArticleUpload} from '../../entity/types'
import Uploader from '../../services/uploader'
import {ForbiddenError, NotFoundError} from '../../errors'

// Ошибка "Новость не найдена"
export class ArticleNotFoundError extends NotFoundError {
  constructor() {
    super('Новость не найдена')
  }
}

class ArticleProvider {
  constructor(
    private repository: ArticleRepository,
    private uploader: Uploader
  ) {}

  // Создать новость
  create = async (c: ArticleUpload): Promise<number> => {
    const infoAvatar = this.uploader.getInfo(c.fileAvatar, 'articleAvatar')
    c.urlAvatar = infoAvatar.url

    const id = await this.repository.insert(c)
    await c.fileAvatar.mv(infoAvatar.path)
    return id
  }

  // Получить новость по id
  getById = (id: number): Promise<[Article, CommentArticle[]]> => {
    const p: [Promise<Article>, Promise<CommentArticle[]>] = [
      this.repository.selectById(id),
      this.getComments(id),
    ]
    return Promise.all<Article, CommentArticle[]>(p).then(([c, comments]) => {
      return [c, comments]
    })
  }

  // Получить все новости
  getAll = (
    limit: number,
    page: number,
    data?: any
  ): Promise<{data: Article[]; count: number}> => {
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

  // Редактировать новость
  update = async (c: ArticleUpload): Promise<number> => {
    const oldArticle = await this.repository.selectById(c.id)

    c.urlAvatar = oldArticle.urlAvatar
    let infoAvatar
    // Если загружена новая аватарка, то обновляем ее
    if (c.fileAvatar) {
      this.uploader.remove(oldArticle.urlAvatar)
      infoAvatar = this.uploader.getInfo(c.fileAvatar, 'articleAvatar')
      c.urlAvatar = infoAvatar.url
      await c.fileAvatar.mv(infoAvatar.path)
    }

    return this.repository.update(c)
  }

  // Удалить новость
  remove = async (article: Article): Promise<number> => {
    const oldArticle = await this.repository.selectById(article.id)
    if (oldArticle.idUser !== article.idUser) {
      throw new ForbiddenError()
    }
    this.uploader.remove(oldArticle.urlAvatar)
    return this.repository.remove(article.id)
  }

  // Создать комментарий к новости
  createComment = async (comment: CommentArticle): Promise<number> => {
    const c = await this.repository.selectById(comment.idArticle)
    if ((c.idUser !== comment.idUser) && (c.comment || c.closed)) {
      throw new ForbiddenError('Комментирование запрещено')
    }
    return this.repository.insertComment(comment)
  }

  // Получить комментарии к новости
  getComments = (id: number): Promise<CommentArticle[]> => {
    return this.repository.selectCommentsByIdArticle(id)
  }

  // Удалить комментарий
  removeComment = async (
    comment: CommentArticle,
    right: boolean
  ): Promise<number> => {
    const oldComment = await this.repository.selectCommentById(comment.id)
    const article = await this.repository.selectById(oldComment.idArticle)
    if (
      oldComment.idUser === comment.idUser ||
      comment.idUser === article.idUser ||
      right
    ) {
      return this.repository.removeComment(comment.id)
    }
    throw new ForbiddenError()
  }
}

export default ArticleProvider
