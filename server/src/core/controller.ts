import {Express, Request} from 'express'
import RightProvider from '../providers/right'
import Auth from '../services/auth'
import TokenStorage from '../services/token'

class Controller {
    protected rightProvider: RightProvider
    protected auth: Auth

    constructor(app: Express) {
        const db = app.get('db')
        this.rightProvider = new RightProvider(db)
        this.auth = new Auth(db)
    }

    protected getUserId = (req: Request) => {
        return this.auth.checkAuth(TokenStorage.getToken(req)).then((id: number) => {
            return id
        }, () => {
            return 0
        })
    }
}

export default Controller