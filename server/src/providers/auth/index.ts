import AuthRepository from '../../repositories/auth'
import {User} from '../../common/entity/types'
import {About, Token} from '../../entity/types'
import Hash from '../../services/hash'
import RegistrationRepository from '../../repositories/registration'
import {ApiError} from '../../errors'

// Ошибки аутентификации
export class AuthError extends ApiError {
  constructor(message: string, name = 'ERROR_AUTH') {
    super(message, name)
  }
}

class AuthProvider {
  constructor(
    private authRepository: AuthRepository,
    private registrationRepository: RegistrationRepository,
    private hash: Hash
  ) {}

  // Аутентификация
  login = async (user: User, about: About): Promise<string> => {
    user.username = user.username.toUpperCase()
    user.password = user.password.toUpperCase()
    user.password = this.hash.getHash(user.username, user.password)
    const lUser = await this.authRepository.login(user)

    // Если есть аккаунт в игре, но не зарегистрирован на сайте, то регистрируем
    if (!lUser.id) {
      user.nickname = user.username
      lUser.id = await this.registrationRepository.insertUser(
        user,
        lUser.idAccount
      )
    }

    return this.authRepository.saveToken({
      idUser: lUser.id,
      text: this.hash.getToken(),
      ip: about.ip,
    } as Token)
  }

  // Выход
  logout = (token: string) => {
    return this.authRepository.logout(token)
  }

  // Получить пользователя по токену
  getUser = async (token: string): Promise<User | null> => {
    if (!token) {
      return null
    }
    return this.authRepository.getUserByToken(token)
  }

  // Получить пользователя с правами по токену
  getUserWithRights = async (token: string): Promise<User | null> => {
    if (!token) {
      return null
    }
    return this.authRepository.getUserWithRightsByToken(token)
  }

  // Получить пользователя по токену и паролю
  getUserByTokenAndPassword = async (
    token: string,
    password: string
  ): Promise<User | null> => {
    if (!token || !password) {
      return null
    }
    const username = await this.authRepository.getUsernameByToken(token)
    if (!username) {
      return null
    }
    password = this.hash.getHash(username, password)
    const user = await this.authRepository.getUserByTokenAndPassword(
      token,
      password
    )
    if (!user) {
      return null
    }
    return user
  }
}

export default AuthProvider
