import Mapper from './mapper'
import Hash from '../../services/hash'
import Uploader from '../../services/uploader'
import {Account, UserPassword} from '../../common/entity/types'
import {About, defaultAvatar, Token, UserAuth} from '../../entity/types'
import RightModel from '../right/model'

class AccountModel {
    private mapper: Mapper
    private hash = new Hash()
    private uploader = new Uploader()
    private rightModel: RightModel

    constructor(connection: any) {
        this.mapper = new Mapper(connection.getPoolPromise())
        this.rightModel = new RightModel(connection)
    }

    // Регистрация
    signUp = async (user: Account, about: About) => {
        user.username = user.username.toUpperCase()
        user.password = user.password.toUpperCase()
        user.password = this.hash.getHash(user.username, user.password)
        const id = await this.mapper.signup(user)
        return this.mapper.saveToken({
            idAccount: id,
            text: this.hash.getToken(),
            ip: about.ip,
        } as Token)
    }

    // Авторизация
    login = async (user: Account, about: About) => {
        user.username = user.username.toUpperCase()
        user.password = user.password.toUpperCase()
        user.password = this.hash.getHash(user.username, user.password)
        const id = await this.mapper.login(user)
        return this.mapper.saveToken({
            idAccount: id,
            text: this.hash.getToken(),
            ip: about.ip
        } as Token)
    }

    // Получить контекст
    getContext = async (token: string) => {
        const account: Account = await this.mapper.getContext(token)
        if (!account.urlAvatar) {
            account.urlAvatar = defaultAvatar
        }
        account.rights = await this.rightModel.getRights(account.id)
        return Promise.resolve(account)
    }

    // Проверка авторизации по токену
    checkAuthByToken = (data: string) => {
        return this.mapper.getIdByToken(data)
    }

    // Проверка авторизации по токену и паролю
    checkAuthByTokenWithPassword = async (token: string, pass: string) => {
        try {
            const username = await this.mapper.getUsernameByToken(token)
            pass = this.hash.getHash(username, pass)
            const id = await this.mapper.getIdByTokenWithPassword(token, pass)
            return {id, username} as UserAuth
        } catch (e) {
            return Promise.reject(e)
        }
    }

    // Выход
    logout = (token: string) => {
        return this.mapper.logout(token)
    }

    // Получить пользователя по id
    getById = (id: number) => {
        return this.mapper.selectById(id).then((user: Account) => {
            if (!user.urlAvatar) {
                user.urlAvatar = defaultAvatar
            }
            return user
        })
    }

    // Получить информацию о пользователе
    getGeneral = async (idProfile: number) => {
        return this.mapper.selectUserGeneralById(idProfile)
    }

    getAll = (limit: number, page: number, data?: any) => {
        const p = []
        p.push(this.mapper.selectAll(limit, page, data))
        p.push(this.mapper.selectCount(data))
        return Promise.all(p).then((r)=>{
            return {
                data: r[0],
                count: r[1],
            }
        })
    }

    // Редактирование основной информации
    updateGeneral = async (account: Account) => {
        await this.mapper.updateGeneral(account)
        return this.mapper.selectUserGeneralById(account.id)
    }

    // Редактирование настроек безопасноти
    updateSecure = async (account: Account) => {
        account.username = account.username.toUpperCase()
        account.password = this.hash.getHash(account.username, account.password)
        return this.mapper.updateSecure(account)
    }

    // Редактирование пароля
    updatePassword = (user: UserPassword) => {
        user.password = this.hash.getHash(user.username, user.password)
        return this.mapper.updatePassword(user)
    }

    // Загрузка аватарки
    updateAvatar = async (id: number, avatar: any) => {
        const oldAvatarPath = (await this.mapper.selectById(id)).urlAvatar
        if (oldAvatarPath) {
            this.uploader.remove(oldAvatarPath)
        }
        const infoAvatar = this.uploader.getInfo(avatar, 'avatar')
        avatar.mv(infoAvatar.path)
        return this.mapper.updateAvatar(id, infoAvatar.url)
    }
}

export default AccountModel