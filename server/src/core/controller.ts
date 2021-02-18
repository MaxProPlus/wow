import {Express, Request} from 'express'
import RightProvider from '../providers/right'
import Auth from '../services/auth'
import TokenStorage from '../services/token'

class Controller {

    constructor(protected rightProvider: RightProvider, protected auth: Auth) {
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