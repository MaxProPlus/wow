import UserRepository from '../../repositories/user'
import Uploader from '../../services/uploader'
import {User} from '../../common/entity/types'
import {defaultAvatar} from '../../entity/types'
import RightProvider from '../right'
import {Smtp} from '../../services/smtp'

class UserProvider {
    constructor(
        private repository: UserRepository,
        private smtp: Smtp,
        private rightProvider: RightProvider,
        private uploader: Uploader,
    ) {
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