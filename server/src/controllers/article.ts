import {Request, Response} from 'express'
import {Article, CommentArticle} from '../common/entity/types'
import Validator from '../common/validator'
import ArticleProvider from '../providers/article'
import {ArticleUpload} from '../entity/types'
import Controller from '../core/controller'
import RightProvider from '../providers/right'
import AuthProvider from '../providers/auth'
import TokenStorage from '../services/token'
import {FileError, ForbiddenError, ParseError, ValidationError} from '../errors'
import RequestFile from '../services/requestFile'

class ArticleController extends Controller {
  constructor(
    rightProvider: RightProvider,
    authProvider: AuthProvider,
    private articleProvider: ArticleProvider,
    private validator: Validator
  ) {
    super(rightProvider, authProvider)
  }

  // Создать новость
  create = async (req: Request, res: Response) => {
    const fileAvatar = RequestFile.get(req, 'fileAvatar')
    if (!fileAvatar) {
      throw new FileError('Аватарка новости не прикрепленна')
    }
    const c: ArticleUpload = req.body
    c.fileAvatar = fileAvatar
    let err = this.validator.validateArticle(c)
    err += this.validator.validateImg(c.fileAvatar)
    if (err) {
      throw new ValidationError(err)
    }
    c.idUser = req.user!.id

    // Проверка прав на управление новостью
    if (!(await this.rightProvider.articleModerator(c.idUser))) {
      throw new ForbiddenError()
    }
    return this.articleProvider.create(c).then((r) => {
      return res.json({
        status: 'OK',
        results: [r],
      })
    })
  }

  // Получить новость по id
  getById = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      throw new ParseError()
    }
    return this.articleProvider
      .getById(id)
      .then(async ([article, comments]) => {
        if (article.closed) {
          const user = await this.authProvider.getUser(
            TokenStorage.getToken(req)
          )
          if (!user || (user && user.id !== article.idUser)) {
            throw new ForbiddenError()
          }
        }
        return res.json({
          status: 'OK',
          results: [article, comments],
        })
      })
  }

  // Получить все новости
  getAll = async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10
    const page = parseInt(req.query.page as string) || 1
    const data: any = {}
    if (req.query.title) {
      data.title = req.query.title
    }
    // Если hidden = 1, то поиск по всем материалам
    // Если hidden = 0, то поиск только по не скрытым материалам
    if (req.query.hidden) {
      data.hidden = parseInt(req.query.hidden as string)
    } else {
      data.hidden = 0
    }
    if (data.hidden) {
      delete data.hidden
    }
    return this.articleProvider.getAll(limit, page, data).then((r) => {
      return res.json({
        status: 'OK',
        results: r,
      })
    })
  }

  // Редактировать новость
  update = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      throw new ParseError()
    }
    const c: ArticleUpload = req.body
    c.id = id
    let err = this.validator.validateArticle(c)

    const fileAvatar = RequestFile.get(req, 'fileAvatar')
    if (fileAvatar) {
      c.fileAvatar = fileAvatar
      err += this.validator.validateImg(c.fileAvatar)
    }

    if (err) {
      throw new ValidationError(err)
    }
    c.idUser = req.user!.id

    // Проверка прав на управление новостью
    if (!(await this.rightProvider.articleModerator(c.idUser))) {
      throw new ForbiddenError()
    }
    return this.articleProvider.update(c).then((r) => {
      return res.json({
        status: 'OK',
        results: [r],
      })
    })
  }

  // Удалить персонажа
  remove = async (req: Request, res: Response) => {
    const c = new Article()
    c.id = parseInt(req.params.id)
    if (isNaN(c.id)) {
      throw new ParseError()
    }
    c.idUser = req.user!.id

    // Проверка прав на управление новостью
    if (!(await this.rightProvider.articleModerator(c.idUser))) {
      throw new ForbiddenError()
    }
    return this.articleProvider.remove(c).then(() => {
      return res.json({
        status: 'OK',
      })
    })
  }

  // Создать комментарий к персонажу
  createComment = async (req: Request, res: Response) => {
    const c: CommentArticle = req.body
    c.idUser = req.user!.id
    const err = this.validator.validateComment(c)
    if (err) {
      throw new ValidationError(err)
    }
    return this.articleProvider.createComment(c).then((r) => {
      return res.json({
        status: 'OK',
        results: [r],
      })
    })
  }

  // Получить комментарии к персонажу
  getComments = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      throw new ParseError()
    }
    return this.articleProvider.getComments(id).then((r) => {
      return res.json({
        status: 'OK',
        results: r,
      })
    })
  }

  // Удалить комментарий
  removeComment = async (req: Request, res: Response) => {
    const c = new CommentArticle()
    c.id = parseInt(req.params.idComment)
    if (isNaN(c.id)) {
      throw new ParseError()
    }
    c.idUser = req.user!.id
    return this.articleProvider.removeComment(c).then(() => {
      return res.json({
        status: 'OK',
      })
    })
  }
}

export default ArticleController
