import UserRepository from '../../repositories/user'
import Uploader from '../../services/uploader'
import {User} from '../../common/entity/types'
import RightProvider from '../right'
import {Smtp} from '../../services/smtp'

class UserProvider {
  constructor(
    private repository: UserRepository,
    private smtp: Smtp,
    private rightProvider: RightProvider,
    private uploader: Uploader
  ) {}

  // Получить контекст
  getContext = async (token: string): Promise<User> => {
    const user: User = await this.repository.getContext(token)
    user.rights = await this.rightProvider.getRights(user.id)
    return user
  }

  // Получить пользователя по id
  getById = (id: number): Promise<User> => {
    return this.repository.selectById(id)
  }

  // Получить информацию о пользователе
  getGeneral = async (idProfile: number): Promise<User> => {
    return this.repository.selectUserGeneralById(idProfile)
  }

  getAll = (
    limit: number,
    page: number,
    data?: any
  ): Promise<{data: User[]; count: number}> => {
    const p = []
    p.push(this.repository.selectAll(limit, page, data))
    p.push(this.repository.selectCount(data))
    return Promise.all<any>(p).then((r) => {
      return {
        data: r[0],
        count: r[1],
      }
    })
  }

  // Редактирование основной информации
  updateGeneral = async (user: User): Promise<number> => {
    return this.repository.updateGeneral(user)
  }

  // Загрузка аватарки
  updateAvatar = async (id: number, avatar: any): Promise<number> => {
    const oldAvatarPath = (await this.repository.selectById(id)).urlAvatar
    if (oldAvatarPath) {
      this.uploader.remove(oldAvatarPath)
    }
    return this.repository.updateAvatar(id, await this.uploader.move(avatar, 'avatar'))
  }
}

export default UserProvider
