import UserRepository from '../../repositories/user'
import Hash from '../../services/hash'
import Uploader from '../../services/uploader'
import {User, UserPassword} from '../../common/entity/types'
import {About, defaultAvatar, Token} from '../../entity/types'
import RightProvider from '../right'
import {Smtp} from '../../services/smtp'

class UserProvider {
    private repository: UserRepository
    private hash = new Hash()
    private uploader = new Uploader()
    private rightProvider: RightProvider
    private smtp: Smtp | null = null

    constructor(connection: any) {
        this.repository = new UserRepository(connection.getPoolPromise())
        this.rightProvider = new RightProvider(connection)
    }

    setSmtp = (smtp: Smtp) => {
        this.smtp = smtp
    }

    // Регистрация
    signUp = async (user: User) => {
        user.nickname = user.username
        user.username = user.username.toUpperCase()
        user.password = user.password.toUpperCase()
        user.password = this.hash.getHash(user.username, user.password)
        user.token = this.hash.getToken()
        try {
            await this.repository.selectAccountByQuery({
                username: user.username,
                email: user.email,
            })
            return Promise.reject('Ошибка регистрации, возможно логин или email уже занят')
        } catch (e) {
        }
        return this.smtp!.sendConfirmation(user.email, user.nickname, user.token).then(() => {
            return this.repository.insertUserReg(user)
        }, () => {
            return Promise.reject('Ошибка при отправке сообщения. Если ошибка повторится, то свяжитесь с администрацией')
        })
    }

    // Подтверждение регистрации
    acceptReg = async (token: string) => {
        const user = await this.repository.selectUserRegByToken(token)
        try {
            await this.repository.selectAccountByQuery({
                username: user.username,
                email: user.email,
            })
            return Promise.reject()
        } catch (e) {
        }
        const id = await this.repository.insertAccount(user)
        await this.repository.insertUser(user, id)
        return this.repository.removeUserReg(token)
    }

    // Подтверждение почты
    acceptEmail = async (token: string) => {
        const user = await this.repository.selectUserEmailByToken(token)
        try {
            await this.repository.selectAccountByQuery({
                email: user.email,
            })
            return Promise.reject()
        } catch (e) {
        }
        await this.repository.updateSecure(user)
        return this.repository.removeUserEmail(token)
    }

    // Авторизация
    login = async (user: User, about: About) => {
        user.username = user.username.toUpperCase()
        user.password = user.password.toUpperCase()
        user.password = this.hash.getHash(user.username, user.password)
        const lUser = await this.repository.login(user)

        // Если есть аккаунт в игре, но не зарегистрирован на сайте, то регистрируем
        if (!lUser.id) {
            user.nickname = user.username
            lUser.id = await this.repository.insertUser(user, lUser.idAccount)
        }

        return this.repository.saveToken({
            idUser: lUser.id,
            text: this.hash.getToken(),
            ip: about.ip,
        } as Token)
    }

    // Получить контекст
    getContext = async (token: string) => {
        const user: User = await this.repository.getContext(token)
        if (!user.urlAvatar) {
            user.urlAvatar = defaultAvatar
        }
        user.rights = await this.rightProvider.getRights(user.id)
        return Promise.resolve(user)
    }

    // Выход
    logout = (token: string) => {
        return this.repository.logout(token)
    }

    // Получить пользователя по id
    getById = (id: number) => {
        return this.repository.selectById(id).then((user: User) => {
            if (!user.urlAvatar) {
                user.urlAvatar = defaultAvatar
            }
            return user
        })
    }

    // Получить информацию о пользователе
    getGeneral = async (idProfile: number) => {
        return this.repository.selectUserGeneralById(idProfile)
    }

    getAll = (limit: number, page: number, data?: any) => {
        const p = []
        p.push(this.repository.selectAll(limit, page, data))
        p.push(this.repository.selectCount(data))
        return Promise.all(p).then((r) => {
            return {
                data: r[0],
                count: r[1],
            }
        })
    }

    // Редактирование основной информации
    updateGeneral = async (user: User) => {
        return this.repository.updateGeneral(user)
    }

    // Редактирование настроек безопасноти
    updateSecure = async (user: User) => {
        user.token = this.hash.getToken()
        try {
            await this.repository.selectAccountByQuery({
                email: user.email,
            })
            return Promise.reject('Ошибка, данный email возможно занят')
        } catch (e) {
        }

        return this.smtp!.sendChangeEmail(user.email, user.token).then(() => {
            return this.repository.insertAccountEmail(user)
        }, () => {
            return Promise.reject('Ошибка при отправке сообщения. Если ошибка повториться, то свяжитесь с администрацией')
        })
    }

    // Редактирование пароля
    updatePassword = (user: UserPassword) => {
        user.password = this.hash.getHash(user.username, user.password)
        return this.repository.updatePassword(user)
    }

    // Загрузка аватарки
    updateAvatar = async (id: number, avatar: any) => {
        const oldAvatarPath = (await this.repository.selectById(id)).urlAvatar
        if (oldAvatarPath) {
            this.uploader.remove(oldAvatarPath)
        }
        const infoAvatar = this.uploader.getInfo(avatar, 'avatar')
        avatar.mv(infoAvatar.path)
        return this.repository.updateAvatar(id, infoAvatar.url)
    }
}

export default UserProvider