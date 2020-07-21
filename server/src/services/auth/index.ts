import AccountModel from '../../models/account/model'

class Auth {
    private userModel: AccountModel

    constructor(connection: any) {
        this.userModel = new AccountModel(connection)
    }

    // Проверка авторизации по токену
    checkAuth = (data: string) => {
        return this.userModel.checkAuthByToken(data)
    }

    // Проверка авторизации по токену и паролю
    checkAuthWithPassword = (token: string, pass: string) => {
        return this.userModel.checkAuthByTokenWithPassword(token, pass)
    }
}

export default Auth
