import UserProvider from '../../providers/account'
import UserRepository from '../../repositories/user'
import {UserAuth} from '../../entity/types'
import Hash from '../hash'

class Auth {
    private userModel: UserProvider
    private repository: UserRepository
    private hash: Hash

    constructor(connection: any) {
        this.userModel = new UserProvider(connection)
        this.repository = new UserRepository(connection.getPoolPromise())
        this.hash = new Hash()
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
