import {Express, Request, Response} from 'express'
import FeedbackModel from '../models/feedback/model'
import {DB} from '../services/mysql'
import Auth from '../services/auth'
import RightModel from '../models/right/model'
import {Feedback} from '../common/entity/types'

class FeedbackController {
    private model: FeedbackModel
    private auth: Auth
    private rightModel: RightModel
    constructor(app: Express) {
        const db = app.get('db') as DB
        this.model = new FeedbackModel(db)
        this.auth = new Auth(db)
        this.rightModel = new RightModel(db)
    }

    getAll = (req: Request, res: Response) => {
        return this.model.getAll().then((r: any) => {
            return res.json({
                status: 'OK',
                results: r
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
        try {
            const idUser = await this.auth.checkAuth(req.cookies.token)
            const flagTicketRead = await this.rightModel.ticketUpdateStatus(idUser)
            if (!flagTicketRead) {
                return res.json({
                    status: 'ERROR_RIGHT',
                    errorMessage: 'Нет прав',
                })
            }
        } catch (err) {
            return res.json({
                status: 'INVALID_AUTH',
                errorMessage: err,
            })
        }
        return this.model.update(list).then(()=>{
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