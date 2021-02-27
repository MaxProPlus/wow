import {NextFunction, Request, RequestHandler, Response} from 'express'
import TokenStorage from '../services/token'
import {authProvider} from '../modules/app'
import {UnauthorizedError} from '../errors'

// прикрепить пользователя к Request
export const getUser: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.user = await authProvider.getUser(TokenStorage.get(req))
  if (!req.user) {
    throw new UnauthorizedError()
  }
  next()
}

// прикрепить пользователя с правами к Request
export const getUserWithRight: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.user = await authProvider.getUserWithRights(TokenStorage.get(req))
  if (!req.user) {
    throw new UnauthorizedError()
  }
  next()
}
