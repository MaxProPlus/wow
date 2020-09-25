import Mapper from '../mappers/guild'
import {Character, CommentGuild, Guild, Story} from '../../common/entity/types'
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
        await Promise.all(c.members.map(async (idLink) => {
            await this.mapper.insertMember(id, idLink)
        }))
        c.fileAvatar.mv(infoAvatar.path)
        return id
    }

    // Получить гильдию по id
    getById = (id: number): Promise<[Guild, CommentGuild[]]> => {
        const p: [Promise<Guild>, Promise<Character[]>, Promise<Story[]>, Promise<CommentGuild[]>] = [
            this.mapper.selectById(id),
            this.mapper.selectMembersById(id),
            this.mapper.selectStoresById(id),
            this.getComments(id),
        ]
        return Promise.all<Guild, Character[], Story[], CommentGuild[]>(p).then(([g, members, stores, comments]) => {
            g.members = members
            g.stores = stores
            return [g, comments]
        })
    }

    // Получить все гильдии
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

    // Редактировать гильдию
    update = async (guild: GuildUpload) => {
        const old = await this.mapper.selectById(guild.id)
        if (old.idAccount !== guild.idAccount) {
            return Promise.reject('Нет прав')
        }

        old.members = await this.mapper.selectMembersById(guild.id)
        // Перебор нового списка участников гильдии
        await Promise.all(guild.members.map(async (el: number) => {
            // Если не находим в старом списке, то добавляем
            if (old.members.findIndex(o => el === o.id) === -1) {
                return await this.mapper.insertMember(guild.id, el)
            }
        }))
        // Перебор старого списка участников гильдии
        await Promise.all(old.members.map(async (el: Character) => {
            // Если не находим в новом списке, то удаляем
            if (guild.members.indexOf(el.id) === -1) {
                return await this.mapper.removeMember(guild.id, el.id)
            }
        }))


        guild.urlAvatar = old.urlAvatar
        // Обновить аватарку
        let infoAvatar
        if (!!guild.fileAvatar) {
            this.uploader.remove(old.urlAvatar)
            infoAvatar = this.uploader.getInfo(guild.fileAvatar, 'guildAvatar')
            guild.urlAvatar = infoAvatar.url
            guild.fileAvatar.mv(infoAvatar.path)
        }
        return this.mapper.update(guild)
    }

    // Удалить гильдию
    remove = async (g: Guild) => {
        const oldGuild = await this.mapper.selectById(g.id)
        if (oldGuild.idAccount !== g.idAccount) {
            return Promise.reject('Нет прав')
        }
        this.uploader.remove(oldGuild.urlAvatar)
        return this.mapper.remove(g.id)
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