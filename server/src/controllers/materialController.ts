import MaterialModel from '../providers/material'
import {Request, Response} from 'express'

class MaterialController {
    constructor(
        private materialProvider: MaterialModel
    ) {
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
        return this.materialProvider.getAll(limit, page, data).then((r: any) => {
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