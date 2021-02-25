import {Request, Response} from 'express'
import {CommentReport, Report} from '../common/entity/types'
import Validator from '../common/validator'
import {ReportUpload} from '../entity/types'
import ReportProvider from '../providers/report'
import {Rights} from '../providers/right'
import AuthProvider from '../providers/auth'
import TokenStorage from '../services/token'
import {FileError, ForbiddenError, ParseError, ValidationError} from '../errors'
import RequestFile from '../services/requestFile'

class ReportController {
  constructor(
    private authProvider: AuthProvider,
    private reportProvider: ReportProvider,
    private validator: Validator
  ) {}

  // Создать отчет / лог
  create = async (req: Request, res: Response) => {
    const fileAvatar = RequestFile.get(req, 'fileAvatar')
    if (!fileAvatar) {
      throw new FileError('Аватарка отчета не прикреплена')
    }
    const c: ReportUpload = req.body
    c.fileAvatar = fileAvatar
    let err = this.validator.validateReport(c)
    err += this.validator.validateImg(c.fileAvatar)
    if (err) {
      throw new ValidationError(err)
    }
    c.idUser = req.user!.id
    return this.reportProvider.create(c).then((r) => {
      return res.json({
        status: 'OK',
        results: [r],
      })
    })
  }

  // Получить отчет по id
  getById = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      throw new ParseError()
    }
    return this.reportProvider.getById(id).then(async ([story, comments]) => {
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

  // Получить все отчеты / логи
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
    return this.reportProvider.getAll(limit, page, data).then((r) => {
      return res.json({
        status: 'OK',
        results: r,
      })
    })
  }

  // Редактировать отчет
  update = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      throw new ParseError()
    }
    const c: ReportUpload = req.body
    c.id = id
    let err = this.validator.validateReport(c)

    const fileAvatar = RequestFile.get(req, 'fileAvatar')
    if (fileAvatar) {
      c.fileAvatar = fileAvatar
      err += this.validator.validateImg(c.fileAvatar)
    }

    if (err) {
      throw new ValidationError(err)
    }
    c.idUser = req.user!.id
    return this.reportProvider.update(c).then((r) => {
      return res.json({
        status: 'OK',
        results: [r],
      })
    })
  }

  // Удалить сюжет
  remove = async (req: Request, res: Response) => {
    const c = new Report()
    c.id = parseInt(req.params.id)
    if (isNaN(c.id)) {
      throw new ParseError()
    }
    c.idUser = req.user!.id
    return this.reportProvider.remove(c).then(() => {
      return res.json({
        status: 'OK',
      })
    })
  }

  // Создать комментарий
  createComment = async (req: Request, res: Response) => {
    const c: CommentReport = req.body
    c.idUser = req.user!.id
    const err = this.validator.validateComment(c)
    if (err) {
      throw new ValidationError(err)
    }
    return this.reportProvider.createComment(c).then((r) => {
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
    return this.reportProvider.getComments(id).then((r) => {
      return res.json({
        status: 'OK',
        results: r,
      })
    })
  }

  // Удалить комментарий
  removeComment = async (req: Request, res: Response) => {
    const c = new CommentReport()
    c.id = parseInt(req.params.idComment)
    if (isNaN(c.id)) {
      throw new ParseError()
    }
    c.idUser = req.user!.id
    return this.reportProvider
      .removeComment(c, req.user!.rights.includes(Rights.COMMENT_MODERATOR))
      .then(() => {
        return res.json({
          status: 'OK',
        })
      })
  }
}

export default ReportController
