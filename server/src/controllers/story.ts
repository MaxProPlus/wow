import {Request, Response} from 'express'
import {CommentStory, Story} from '../common/entity/types'
import Validator from '../common/validator'
import {StoryUpload} from '../entity/types'
import StoryProvider from '../providers/story'
import {Rights} from '../providers/right'
import AuthProvider from '../providers/auth'
import TokenStorage from '../services/token'
import {FileError, ForbiddenError, ParseError, ValidationError} from '../errors'
import RequestFile from '../services/requestFile'

class StoryController {
  constructor(
    private authProvider: AuthProvider,
    private storyProvider: StoryProvider,
    private validator: Validator
  ) {}

  // Создать сюжет
  create = async (req: Request, res: Response) => {
    const fileAvatar = RequestFile.get(req, 'fileAvatar')
    if (!fileAvatar) {
      throw new FileError('Аватарка сюжета не прикреплена')
    }
    const c: StoryUpload = req.body
    c.fileAvatar = fileAvatar
    let err = this.validator.validateStory(c)
    err += this.validator.validateImg(c.fileAvatar)
    if (err) {
      throw new ValidationError(err)
    }
    c.idUser = req.user!.id
    return this.storyProvider.create(c).then((r) => {
      return res.json({
        status: 'OK',
        results: [r],
      })
    })
  }

  // Получить сюжет по id
  getById = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      throw new ParseError()
    }
    return this.storyProvider.getById(id).then(async ([story, comments]) => {
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

  // Получить все сюжеты
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
    return this.storyProvider.getAll(limit, page, data).then((r) => {
      return res.json({
        status: 'OK',
        results: r,
      })
    })
  }

  // Редактировать сюжет
  update = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      throw new ParseError()
    }
    const c: StoryUpload = req.body
    c.id = id
    let err = this.validator.validateStory(c)

    const fileAvatar = RequestFile.get(req, 'fileAvatar')
    if (fileAvatar) {
      c.fileAvatar = fileAvatar
      err += this.validator.validateImg(c.fileAvatar)
    }

    if (err) {
      throw new ValidationError(err)
    }
    c.idUser = req.user!.id
    return this.storyProvider.update(c).then((r) => {
      return res.json({
        status: 'OK',
        results: [r],
      })
    })
  }

  // Удалить сюжет
  remove = async (req: Request, res: Response) => {
    const c = new Story()
    c.id = parseInt(req.params.id)
    if (isNaN(c.id)) {
      throw new ParseError()
    }
    c.idUser = req.user!.id
    return this.storyProvider.remove(c).then(() => {
      return res.json({
        status: 'OK',
      })
    })
  }

  // Создать комментарий
  createComment = async (req: Request, res: Response) => {
    const c: CommentStory = req.body
    c.idUser = req.user!.id
    const err = this.validator.validateComment(c)
    if (err) {
      throw new ValidationError(err)
    }
    return this.storyProvider.createComment(c).then((r) => {
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
    return this.storyProvider.getComments(id).then((r) => {
      return res.json({
        status: 'OK',
        results: r,
      })
    })
  }

  // Удалить комментарий
  removeComment = async (req: Request, res: Response) => {
    const c = new CommentStory()
    c.id = parseInt(req.params.idComment)
    if (isNaN(c.id)) {
      throw new ParseError()
    }
    c.idUser = req.user!.id
    return this.storyProvider
      .removeComment(c, req.user!.rights.includes(Rights.COMMENT_MODERATOR))
      .then(() => {
        return res.json({
          status: 'OK',
        })
      })
  }
}

export default StoryController
