import {User, UserPassword} from '../../common/entity/types'
import RegistrationRepository from '../../repositories/registration'
import Hash from '../../services/hash'
import {Smtp} from '../../services/smtp'
import {ApiError} from '../../errors'
import ConfigProvider from '../../services/config'

// Ошибка регистрации
export class RegistrationError extends ApiError {
    constructor(message: string, name: string = 'REGISTRATION_ERROR') {
        super(message, name)
    }
}

class RegistrationProvider {
    constructor(
        private registrationRepository: RegistrationRepository,
        private configProvider: ConfigProvider,
        private hash: Hash,
        private smtp: Smtp
    ) {
    }

    // Регистрация
    signUp = async (user: User): Promise<string> => {
        user.nickname = user.username
        user.username = user.username.toUpperCase()
        user.password = user.password.toUpperCase()
        user.password = this.hash.getHash(user.username, user.password)
        user.token = this.hash.getToken()

        // Если username и email свободен, то продолжить
        const account = await this.registrationRepository.selectAccountByQuery({
            username: user.username,
            email: user.email,
        })
        if (account) {
            throw new RegistrationError('Ошибка, возможно логин или email уже занят')
        }

        if (!this.configProvider.get('sendEmail')) {
            await this.registrationRepository.insertUserReg(user)
            await this.acceptReg(user.token)
            return 'Регистрация прошла успешно'
        }
        return this.smtp.sendConfirmation(user.email, user.nickname, user.token).then(async () => {
            await this.registrationRepository.insertUserReg(user)
            return 'Письмо отправлено на почту'
        })
    }

    // Подтверждение регистрации
    acceptReg = async (token: string): Promise<void> => {
        const user = await this.registrationRepository.selectUserRegByToken(token)

        // Если username и email свободен, то продолжить
        const account = await this.registrationRepository.selectAccountByQuery({
            username: user.username,
            email: user.email,
        })
        if (account) {
            throw new RegistrationError('username или email занят')
        }

        const id = await this.registrationRepository.insertAccount(user)
        await this.registrationRepository.insertUser(user, id)
        return this.registrationRepository.removeUserReg(token)
    }

    // Подтверждение почты
    acceptEmail = async (token: string): Promise<void> => {
        const user = await this.registrationRepository.selectUserEmailByToken(token)

        // Проверка на занятость email
        const account = await this.registrationRepository.selectAccountByQuery({
            email: user.email,
        })
        if (account) {
            throw new RegistrationError('email занят')
        }
        await this.registrationRepository.updateSecure(user)
        return this.registrationRepository.removeUserEmail(token)
    }

    // Редактирование настроек безопасноти
    updateSecure = async (user: User): Promise<string> => {
        user.token = this.hash.getToken()

        const account = await this.registrationRepository.selectAccountByQuery({
            email: user.email,
        })
        if (account) {
            throw new RegistrationError('Ошибка, данный email возможно занят')
        }

        if (!this.configProvider.get('sendEmail')) {
            await this.registrationRepository.insertAccountEmail(user)
            await this.acceptEmail(user.token)
            return 'Почта успешно изменена'
        }
        return this.smtp.sendChangeEmail(user.email, user.token).then(async () => {
            await this.registrationRepository.insertAccountEmail(user)
            return 'Подтверждение отправлено на почту'
        })
    }

    // Редактирование пароля
    updatePassword = (user: UserPassword): Promise<number> => {
        user.password = this.hash.getHash(user.username, user.password)
        return this.registrationRepository.updatePassword(user)
    }
}

export default RegistrationProvider