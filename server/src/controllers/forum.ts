import {Request, Response} from 'express'
import {CommentForum, Forum} from '../common/entity/types'
import Validator from '../common/validator'
import {ForumUpload} from '../entity/types'
import ForumProvider from '../providers/forum'
import Controller from '../core/controller'
import RightProvider from '../providers/right'
import AuthProvider from '../providers/auth'
import TokenStorage from '../services/token'
import {FileError, ForbiddenError, ParseError, ValidationError} from '../errors'
import RequestFile from '../services/requestFile'

class ForumController extends Controller {
  constructor(
    rightProvider: RightProvider,
    authProvider: AuthProvider,
    private forumProvider: ForumProvider,
    private validator: Validator
  ) {
    super(rightProvider, authProvider)
  }

  // Создать форум
  create = async (req: Request, res: Response) => {
    const fileAvatar = RequestFile.get(req, 'fileAvatar')
    if (!fileAvatar) {
      throw new FileError('Аватарка форума не прикреплена')
    }
    const c: ForumUpload = req.body
    c.fileAvatar = fileAvatar
    let err = this.validator.validateForum(c)
    err += this.validator.validateImg(c.fileAvatar)
    if (err) {
      throw new ValidationError(err)
    }
    c.idUser = req.user!.id
    return this.forumProvider.create(c).then((r) => {
      return res.json({
        status: 'OK',
        results: [r],
      })
    })
  }

  // Получить форум по id
  getById = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      throw new ParseError()
    }
    return this.forumProvider.getById(id).then(async ([story, comments]) => {
      if (story.closed) {
        const user = await this.authProvider.getUser(TokenStorage.getToken(req))
        if (!user || (user && user.id !== story.idUser)) {
          throw new ForbiddenError()
        }
      }
      return res.json({
        status: 'OK',
        results: [story, comments],
      })
    })
  }

  // Получить все форумы
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
    return this.forumProvider.getAll(limit, page, data).then((r) => {
      return res.json({
        status: 'OK',
        results: r,
      })
    })
  }

  // Редактировать форум
  update = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      throw new ParseError()
    }
    const c: ForumUpload = req.body
    c.id = id
    let err = this.validator.validateForum(c)

    const fileAvatar = RequestFile.get(req, 'fileAvatar')
    if (fileAvatar) {
      c.fileAvatar = fileAvatar
      err += this.validator.validateImg(c.fileAvatar)
    }

    if (err) {
      throw new ValidationError(err)
    }
    c.idUser = req.user!.id
    return this.forumProvider.update(c).then((r) => {
      return res.json({
        status: 'OK',
        results: [r],
      })
    })
  }

  // Удалить форум
  remove = async (req: Request, res: Response) => {
    const c = new Forum()
    c.id = parseInt(req.params.id)
    if (isNaN(c.id)) {
      throw new ParseError()
    }
    c.idUser = req.user!.id
    return this.forumProvider.remove(c).then(() => {
      return res.json({
        status: 'OK',
      })
    })
  }

  // Создать комментарий
  createComment = async (req: Request, res: Response) => {
    const c: CommentForum = req.body
    c.idUser = req.user!.id
    const err = this.validator.validateComment(c)
    if (err) {
      throw new ValidationError(err)
    }
    return this.forumProvider.createComment(c).then((r) => {
      return res.json({
        status: 'OK',
        results: [r],
      })
    })
  }

  // Получить комментарии
  getComments = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      throw new ParseError()
    }
    return this.forumProvider.getComments(id).then((r) => {
      return res.json({
        status: 'OK',
        results: r,
      })
    })
  }

  // Удалить комментарий
  removeComment = async (req: Request, res: Response) => {
    const c = new CommentForum()
    c.id = parseInt(req.params.idComment)
    if (isNaN(c.id)) {
      throw new ParseError()
    }
    c.idUser = req.user!.id
    return this.forumProvider.removeComment(c).then(() => {
      return res.json({
        status: 'OK',
      })
    })
  }
}

export default ForumController
