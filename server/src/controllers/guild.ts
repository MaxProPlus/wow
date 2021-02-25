import {Request, Response} from 'express'
import {CommentGuild, Guild} from '../common/entity/types'
import Validator from '../common/validator'
import {GuildUpload} from '../entity/types'
import GuildProvider from '../providers/guild'
import AuthProvider from '../providers/auth'
import TokenStorage from '../services/token'
import {FileError, ForbiddenError, ParseError, ValidationError} from '../errors'
import RequestFile from '../services/requestFile'
import {Rights} from '../providers/right'

class GuildController {
  constructor(
    private authProvider: AuthProvider,
    private guildProvider: GuildProvider,
    private validator: Validator
  ) {}

  // Создать гильдию
  create = async (req: Request, res: Response) => {
    const fileAvatar = RequestFile.get(req, 'fileAvatar')
    if (!fileAvatar) {
      throw new FileError('Аватарка гильдии не прикреплена')
    }
    const c: GuildUpload = req.body
    c.fileAvatar = fileAvatar
    let err = this.validator.validateGuild(c)
    err += this.validator.validateImg(c.fileAvatar)
    if (err) {
      throw new ValidationError(err)
    }
    c.idUser = req.user!.id
    return this.guildProvider.create(c).then((r) => {
      return res.json({
        status: 'OK',
        results: [r],
      })
    })
  }

  // Получить гильдию по id
  getById = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      throw new ParseError()
    }
    return this.guildProvider.getById(id).then(async ([guild, comments]) => {
      if (guild.closed) {
        const user = await this.authProvider.getUser(TokenStorage.getToken(req))
        if (!user || (user && user.id !== guild.idUser)) {
          throw new ForbiddenError()
        }
      }
      return res.json({
        status: 'OK',
        results: [guild, comments],
      })
    })
  }

  // Получить все гильдии
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
    return this.guildProvider.getAll(limit, page, data).then((r) => {
      return res.json({
        status: 'OK',
        results: r,
      })
    })
  }

  // Редактировать гильдию
  update = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      throw new ParseError()
    }
    const c: GuildUpload = req.body
    c.id = id
    let err = this.validator.validateGuild(c)

    const fileAvatar = RequestFile.get(req, 'fileAvatar')
    if (fileAvatar) {
      c.fileAvatar = fileAvatar
      err += this.validator.validateImg(c.fileAvatar)
    }

    if (err) {
      throw new ValidationError(err)
    }
    c.idUser = req.user!.id
    return this.guildProvider.update(c).then((r) => {
      return res.json({
        status: 'OK',
        results: [r],
      })
    })
  }

  // Удалить гильдию
  remove = async (req: Request, res: Response) => {
    const c = new Guild()
    c.id = parseInt(req.params.id)
    if (isNaN(c.id)) {
      throw new ParseError()
    }
    c.idUser = req.user!.id
    return this.guildProvider.remove(c).then(() => {
      return res.json({
        status: 'OK',
      })
    })
  }

  // Создать комментарий
  createComment = async (req: Request, res: Response) => {
    const c: CommentGuild = req.body
    c.idUser = req.user!.id
    const err = this.validator.validateComment(c)
    if (err) {
      throw new ValidationError(err)
    }
    return this.guildProvider.createComment(c).then((r) => {
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
    return this.guildProvider.getComments(id).then((r) => {
      return res.json({
        status: 'OK',
        results: r,
      })
    })
  }

  // Удалить комментарий
  removeComment = async (req: Request, res: Response) => {
    const c = new CommentGuild()
    c.id = parseInt(req.params.idComment)
    if (isNaN(c.id)) {
      throw new ParseError()
    }
    c.idUser = req.user!.id
    return this.guildProvider
      .removeComment(c, req.user!.rights.includes(Rights.COMMENT_MODERATOR))
      .then(() => {
        return res.json({
          status: 'OK',
        })
      })
  }
}

export default GuildController
