import {User, UserPassword} from '../common/entity/types'
import RegistrationRepository from '../repositories/registration'
import Hash from '../services/hash'
import {Smtp} from '../services/smtp'

class RegistrationProvider {
    constructor(
        private registrationRepository: RegistrationRepository,
        private hash: Hash,
        private smtp: Smtp
    ) {
    }

    // Регистрация
    signUp = async (user: User) => {
        user.nickname = user.username
        user.username = user.username.toUpperCase()
        user.password = user.password.toUpperCase()
        user.password = this.hash.getHash(user.username, user.password)
        user.token = this.hash.getToken()
        try {
            await this.registrationRepository.selectAccountByQuery({
                username: user.username,
                email: user.email,
            })
            return Promise.reject('Ошибка регистрации, возможно логин или email уже занят')
        } catch (e) {
        }
        if (!parseInt(process.env.SEND_EMAIL as string)) {
            await this.registrationRepository.insertUserReg(user)
            await this.acceptReg(user.token)
            return 'Регистрация прошла успешно'
        }
        return this.smtp.sendConfirmation(user.email, user.nickname, user.token).then(async () => {
            await this.registrationRepository.insertUserReg(user)
            return 'Письмо отправлено на почту'
        }, () => {
            return Promise.reject('Ошибка при отправке сообщения. Если ошибка повторится, то свяжитесь с администрацией')
        })
    }

    // Подтверждение регистрации
    acceptReg = async (token: string) => {
        const user = await this.registrationRepository.selectUserRegByToken(token)
        try {
            await this.registrationRepository.selectAccountByQuery({
                username: user.username,
                email: user.email,
            })
            return Promise.reject()
        } catch (e) {
        }
        const id = await this.registrationRepository.insertAccount(user)
        await this.registrationRepository.insertUser(user, id)
        return this.registrationRepository.removeUserReg(token)
    }

    // Подтверждение почты
    acceptEmail = async (token: string) => {
        const user = await this.registrationRepository.selectUserEmailByToken(token)
        try {
            await this.registrationRepository.selectAccountByQuery({
                email: user.email,
            })
            return Promise.reject()
        } catch (e) {
        }
        await this.registrationRepository.updateSecure(user)
        return this.registrationRepository.removeUserEmail(token)
    }

    // Редактирование настроек безопасноти
    updateSecure = async (user: User) => {
        user.token = this.hash.getToken()
        try {
            await this.registrationRepository.selectAccountByQuery({
                email: user.email,
            })
            return Promise.reject('Ошибка, данный email возможно занят')
        } catch (e) {
        }
        if (!parseInt(process.env.SEND_EMAIL as string)) {
            await this.registrationRepository.insertAccountEmail(user)
            await this.acceptEmail(user.token)
            return 'Почта успешно изменена'
        }
        return this.smtp.sendChangeEmail(user.email, user.token).then(async () => {
            await this.registrationRepository.insertAccountEmail(user)
            return 'Подтверждение отправлено на почту'
        }, () => {
            return Promise.reject('Ошибка при отправке сообщения. Если ошибка повториться, то свяжитесь с администрацией')
        })
    }

    // Редактирование пароля
    updatePassword = (user: UserPassword) => {
        user.password = this.hash.getHash(user.username, user.password)
        return this.registrationRepository.updatePassword(user)
    }
}

export default RegistrationProvider