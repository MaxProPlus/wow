import UserProvider from '../../providers/account'
import UserRepository from '../../repositories/user'
import {UserAuth} from '../../entity/types'
import Hash from '../hash'

class Auth {
    constructor(
        private repository: UserRepository,
        private userModel: UserProvider,
        private hash: Hash
    ) {
    }

    // Проверка авторизации по токену
    checkAuth = (data: string) => {
        return this.repository.getIdByToken(data)
    }

    // Проверка авторизации по токену и паролю
    checkAuthWithPassword = async (token: string, pass: string) => {
        try {
            const username = await this.repository.getUsernameByToken(token)
            pass = this.hash.getHash(username, pass)
            const id = await this.repository.getIdByTokenWithPassword(token, pass)
            return {id, username} as UserAuth
        } catch (e) {
            return Promise.reject(e)
        }
    }
}

export default Auth
