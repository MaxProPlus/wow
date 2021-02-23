import {Request, Response} from 'express'
import FeedbackProvider from '../providers/feedback'
import {Feedback} from '../common/entity/types'
import Controller from '../core/controller'
import RightProvider from '../providers/right'
import AuthProvider from '../providers/auth'
import {ForbiddenError} from '../errors'

class FeedbackController extends Controller {
    constructor(
        rightProvider: RightProvider,
        authProvider: AuthProvider,
        private feedbackProvider: FeedbackProvider
    ) {
        super(rightProvider, authProvider)
    }

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
        const idUser = req.user!.id
        const flagFeedbackModerator = await this.rightProvider.feedbackModerator(idUser)
        if (!flagFeedbackModerator) {
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