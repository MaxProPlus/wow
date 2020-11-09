import MaterialModel from '../models/material/model'
import {Express, Request, Response} from 'express'

class MaterialController {
    private materialModel: MaterialModel

    constructor(app: Express) {
        const db = app.get('db')
        this.materialModel = new MaterialModel(db)
    }

    // Получить все материалы
    getAll = async (req: Request, res: Response) => {
        const limit = parseInt(req.query.limit as string) || 10
        const page = parseInt(req.query.page as string) || 1
        const data: any = {}
        if (!!req.query.title) {
            data.title = req.query.title
        } else {
            data.title = ''
        }
        return this.materialModel.getAll(limit, page, data).then((r: any) => {
            return res.json({
                status: 'OK',
                results: r,
            })
        }, (err: string) => {
            return res.json({
                status: 'ERROR',
                errorMessage: err,
            })
        })
    }
}

export default MaterialController