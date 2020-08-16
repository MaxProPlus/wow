import Mapper from './mapper'
import {CommentGuild, Guild} from '../../common/entity/types'
import {defaultAvatar, GuildUpload} from '../../entity/types'
import Uploader from '../../services/uploader'

class GuildModel {
    private mapper: Mapper
    private uploader = new Uploader()

    constructor(connection: any) {
        this.mapper = new Mapper(connection.getPoolPromise())
    }

    // Создать гильдию
    create = async (c: GuildUpload) => {
        const infoAvatar = this.uploader.getInfo(c.fileAvatar, 'guildAvatar')
        c.urlAvatar = infoAvatar.url

        const id = await this.mapper.insert(c)
        c.fileAvatar.mv(infoAvatar.path)
        return id
    }

    // Получить гильдию по id
    getById = (id: number): Promise<[Guild, CommentGuild]> => {
        const p = []
        p.push(this.mapper.selectById(id))
        p.push(this.getComments(id))
        return Promise.all(p) as Promise<[Guild, CommentGuild]>
    }

    // Получить все гильдии
    getAll = async (limit: number, page: number) => {
        const p = []
        p.push(this.mapper.selectAll(limit, page))
        p.push(this.mapper.selectCount())
        const r = await Promise.all(p)
        return {
            data: r[0],
            count: r[1],
        }
    }

    // Редактировать гильдию
    update = async (c: GuildUpload) => {
        const oldCharacter = await this.mapper.selectById(c.id)
        if (oldCharacter.idAccount !== c.idAccount) {
            return Promise.reject('Нет прав')
        }
        c.urlAvatar = oldCharacter.urlAvatar
        let infoAvatar
        if (!!c.fileAvatar) {
            this.uploader.remove(oldCharacter.urlAvatar)
            infoAvatar = this.uploader.getInfo(c.fileAvatar, 'guildAvatar')
            c.urlAvatar = infoAvatar.url
            c.fileAvatar.mv(infoAvatar.path)
        }
        return this.mapper.update(c)
    }

    // Удалить гильдию
    remove = (id: number) => {
        return this.mapper.remove(id)
    }

    // Создать комментарий
    createComment = async (comment: CommentGuild) => {
        const c = await this.mapper.selectById(comment.idGuild)
        if (!!c.comment || (!!c.closed && c.idAccount !== comment.idAccount)) {
            return Promise.reject('Комментирование запрещено')
        }
        return this.mapper.insertComment(comment)
    }

    // Получить комментарии
    getComments = async (id: number) => {
        const comments = await this.mapper.selectCommentsByIdGuild(id)
        comments.forEach((c: CommentGuild) => {
            if (!c.authorUrlAvatar) {
                c.authorUrlAvatar = defaultAvatar
            }
        })
        return comments
    }

    // Удалить комментарий
    removeComment = (id: number) => {
        return this.mapper.removeComment(id)
    }
}

export default GuildModel