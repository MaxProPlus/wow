import {Request, Response} from 'express'
import FeedbackProvider from '../providers/feedback'
import {Feedback} from '../common/entity/types'
import {Rights} from '../providers/right'
import {ForbiddenError} from '../errors'

class FeedbackController {
  constructor(private feedbackProvider: FeedbackProvider) {}

  // Получить список администраторов
  getAll = (req: Request, res: Response) => {
    return this.feedbackProvider.getAll().then((r) => {
      return res.json({
        status: 'OK',
        results: r,
      })
    })
  }

  // Обновить список администраторов
  update = async (req: Request, res: Response) => {
    const list = req.body as Feedback[]
    if (!req.user!.rights.includes(Rights.FEEDBACK_MODERATOR)) {
      throw new ForbiddenError()
    }
    return this.feedbackProvider.update(list).then(() => {
      return res.json({
        status: 'OK',
      })
    })
  }
}

export default FeedbackController
