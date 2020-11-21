import {Express, Request, Response} from 'express'
import FeedbackProvider from '../providers/feedback'
import {Feedback} from '../common/entity/types'
import Controller from '../core/controller'

class FeedbackController extends Controller {
    private feedbackProvider: FeedbackProvider

    constructor(app: Express) {
        super(app)
        const db = app.get('db')
        this.feedbackProvider = new FeedbackProvider(db)
    }

    getAll = (req: Request, res: Response) => {
        return this.feedbackProvider.getAll().then((r: any) => {
            return res.json({
                status: 'OK',
                results: r,
            })
        }, (err: any) => {
            return res.json({
                status: 'ERROR',
                errorMessage: err,
            })
        })
    }

    update = async (req: Request, res: Response) => {
        const list = req.body as Feedback[]
        const idUser = req.userId!
        const flagFeedbackModerator = await this.rightProvider.feedbackModerator(idUser)
        if (!flagFeedbackModerator) {
            return res.json({
                status: 'ERROR_RIGHT',
                errorMessage: 'Нет прав',
            })
        }
        return this.feedbackProvider.update(list).then(() => {
            return res.json({
                status: 'OK',
            })
        }, (err: any) => {
            return res.json({
                status: 'ERROR',
                errorMessage: err,
            })
        })
    }
}

export default FeedbackController