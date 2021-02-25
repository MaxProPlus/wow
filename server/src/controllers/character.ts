import {Request, Response} from 'express'
import {Character, CommentCharacter} from '../common/entity/types'
import Validator from '../common/validator'
import CharacterProvider from '../providers/character'
import {CharacterUpload} from '../entity/types'
import AuthProvider from '../providers/auth'
import TokenStorage from '../services/token'
import {FileError, ForbiddenError, ParseError, ValidationError} from '../errors'
import RequestFile from '../services/requestFile'
import {Rights} from '../providers/right'

class CharacterController {
  constructor(
    private authProvider: AuthProvider,
    private characterProvider: CharacterProvider,
    private validator: Validator
  ) {}

  // Создать персонажа
  create = async (req: Request, res: Response) => {
    const fileAvatar = RequestFile.get(req, 'fileAvatar')
    if (!fileAvatar) {
      throw new FileError('Аватарка персонажа не прикрепленна')
    }
    const c: CharacterUpload = req.body
    c.fileAvatar = fileAvatar
    let err = this.validator.validateCharacter(c)
    err += this.validator.validateImg(c.fileAvatar)
    if (err) {
      throw new ValidationError(err)
    }
    c.idUser = req.user!.id
    return this.characterProvider.create(c).then((r) => {
      return res.json({
        status: 'OK',
        results: [r],
      })
    })
  }

  // Получить персонажа по id
  getById = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      throw new ParseError()
    }
    return this.characterProvider
      .getById(id)
      .then(async ([character, comments]) => {
        if (character.closed) {
          const user = await this.authProvider.getUser(
            TokenStorage.getToken(req)
          )
          if (!user || (user && user.id !== character.idUser)) {
            throw new ForbiddenError()
          }
        }
        return res.json({
          status: 'OK',
          results: [character, comments],
        })
      })
  }

  // Получить всех персонажей
  getAll = async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10
    const page = parseInt(req.query.page as string) || 1
    const data: any = {}
    if (req.query.title) {
      data.title = req.query.title
    }
    if (req.query.nickname) {
      data.nickname = req.query.nickname
    }
    if (req.query.race) {
      data.race = req.query.race
    }
    if (req.query.sex) {
      data.sex = parseInt(req.query.sex as string)
    }
    if (req.query.active) {
      data.active = parseInt(req.query.active as string)
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
    return this.characterProvider.getAll(limit, page, data).then((r) => {
      return res.json({
        status: 'OK',
        results: r,
      })
    })
  }

  // Редактировать персонажа
  update = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      throw new ParseError()
    }
    const c: CharacterUpload = req.body
    c.id = id
    let err = this.validator.validateCharacter(c)

    const fileAvatar = RequestFile.get(req, 'fileAvatar')
    if (fileAvatar) {
      c.fileAvatar = fileAvatar
      err += this.validator.validateImg(c.fileAvatar)
    }

    if (err) {
      throw new ValidationError(err)
    }
    c.idUser = req.user!.id
    return this.characterProvider.update(c).then((r) => {
      return res.json({
        status: 'OK',
        results: [r],
      })
    })
  }

  // Удалить персонажа
  remove = async (req: Request, res: Response) => {
    const c = new Character()
    c.id = parseInt(req.params.id)
    if (isNaN(c.id)) {
      throw new ParseError()
    }
    c.idUser = req.user!.id
    return this.characterProvider.remove(c).then(() => {
      return res.json({
        status: 'OK',
      })
    })
  }

  // Создать комментарий к персонажу
  createComment = async (req: Request, res: Response) => {
    const c: CommentCharacter = req.body
    c.idUser = req.user!.id
    const err = this.validator.validateComment(c)
    if (err) {
      throw new ValidationError(err)
    }
    return this.characterProvider.createComment(c).then((r) => {
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
    return this.characterProvider.getComments(id).then((r) => {
      return res.json({
        status: 'OK',
        results: r,
      })
    })
  }

  // Удалить комментарий
  removeComment = async (req: Request, res: Response) => {
    const c = new CommentCharacter()
    c.id = parseInt(req.params.idComment)
    if (isNaN(c.id)) {
      throw new ParseError()
    }
    c.idUser = req.user!.id
    return this.characterProvider
      .removeComment(c, req.user!.rights.includes(Rights.COMMENT_MODERATOR))
      .then(() => {
        return res.json({
          status: 'OK',
        })
      })
  }
}

export default CharacterController
