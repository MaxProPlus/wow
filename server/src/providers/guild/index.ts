import GuildRepository from '../../repositories/guild'
import {Character, CommentGuild, Guild, Report, Story, User} from '../../common/entity/types'
import {defaultAvatar, GuildUpload} from '../../entity/types'
import Uploader from '../../services/uploader'
import RightProvider from '../right'

class GuildProvider {
    private repository: GuildRepository
    private uploader = new Uploader()
    private rightProvider: RightProvider

    constructor(connection: any) {
        this.repository = new GuildRepository(connection.getPoolPromise())
        this.rightProvider = new RightProvider(connection)
    }

    // Создать гильдию
    create = async (c: GuildUpload) => {
        const infoAvatar = this.uploader.getInfo(c.fileAvatar, 'guildAvatar')
        c.urlAvatar = infoAvatar.url

        const id = await this.repository.insert(c)
        const p: Promise<any>[] = []
        p.push(Promise.all(c.members.map(async (idLink) => {
            await this.repository.insertMember(id, idLink)
        })))
        p.push(Promise.all(c.coauthors.map(async (el: number) => {
            return this.repository.insertCoauthor(id, el)
        })))
        p.push(c.fileAvatar.mv(infoAvatar.path))
        await Promise.all(p)
        return id
    }

    // Получить гильдию по id
    getById = (id: number): Promise<[Guild, CommentGuild[]]> => {
        const p = [
            this.repository.selectById(id),
            this.repository.selectMembersById(id),
            this.repository.selectStoresById(id),
            this.repository.selectReportsById(id),
            this.repository.selectCoauthorById(id),
            this.getComments(id),
        ]
        return Promise.all<Guild, Character[], Story[], Report[], User[], CommentGuild[]>(p as any).then(([g, members, stores, reports, coauthors, comments]) => {
            g.members = members
            g.stores = stores
            g.reports = reports
            g.coauthors = coauthors
            return [g, comments]
        })
    }

    // Получить все гильдии
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

    // Редактировать гильдию
    update = async (guild: GuildUpload) => {
        const old = await this.repository.selectById(guild.id)
        old.coauthors = await this.repository.selectCoauthorById(guild.id)
        if (old.idUser !== guild.idUser && (old.coauthors.findIndex((el: User) => el.id === guild.idUser)) === -1) {
            return Promise.reject('Нет прав')
        }

        const p: Promise<any>[] = []

        old.members = await this.repository.selectMembersById(guild.id)
        // Перебор нового списка участников гильдии
        p.push(Promise.all(guild.members.map((el: number) => {
            // Если не находим в старом списке, то добавляем
            if (old.members.findIndex(o => el === o.id) === -1) {
                return this.repository.insertMember(guild.id, el)
            }
        })))
        // Перебор старого списка участников гильдии
        p.push(Promise.all(old.members.map((el: Character) => {
            // Если не находим в новом списке, то удаляем
            if (guild.members.indexOf(el.id) === -1) {
                return this.repository.removeMember(guild.id, el.id)
            }
        })))

        // Перебор нового списка соавторов
        p.push(Promise.all(guild.coauthors.map((el: number) => {
            // Если не находим в старом списке, то добавляем
            if (old.coauthors.findIndex(o => el === o.id) === -1) {
                return this.repository.insertCoauthor(guild.id, el)
            }
        })))
        // Перебор старого списка соавторов
        p.push(Promise.all(old.coauthors.map((el: User) => {
            // Если не находим в новом списке, то удаляем
            if (guild.coauthors.indexOf(el.id) === -1) {
                return this.repository.removeCoauthor(guild.id, el.id)
            }
        })))


        guild.urlAvatar = old.urlAvatar
        // Обновить аватарку
        let infoAvatar
        if (!!guild.fileAvatar) {
            this.uploader.remove(old.urlAvatar)
            infoAvatar = this.uploader.getInfo(guild.fileAvatar, 'guildAvatar')
            guild.urlAvatar = infoAvatar.url
            p.push(guild.fileAvatar.mv(infoAvatar.path))
        }
        await Promise.all(p)
        return this.repository.update(guild)
    }

    // Удалить гильдию
    remove = async (guild: Guild) => {
        const old = await this.repository.selectById(guild.id)
        old.coauthors = await this.repository.selectCoauthorById(guild.id)
        if (old.idUser !== guild.idUser && (old.coauthors.findIndex((el: User) => el.id === guild.idUser)) === -1) {
            return Promise.reject('Нет прав')
        }
        this.uploader.remove(old.urlAvatar)
        return this.repository.remove(guild.id)
    }

    // Создать комментарий
    createComment = async (comment: CommentGuild) => {
        const c = await this.repository.selectById(comment.idGuild)
        if (!!c.comment || (!!c.closed && c.idUser !== comment.idUser)) {
            return Promise.reject('Комментирование запрещено')
        }
        return this.repository.insertComment(comment)
    }

    // Получить комментарии
    getComments = async (id: number) => {
        const comments = await this.repository.selectCommentsByIdGuild(id)
        comments.forEach((c: CommentGuild) => {
            if (!c.authorUrlAvatar) {
                c.authorUrlAvatar = defaultAvatar
            }
        })
        return comments
    }

    // Удалить комментарий
    removeComment = async (comment: CommentGuild) => {
        const oldComment = await this.repository.selectCommentById(comment.id)
        const guild = await this.repository.selectById(oldComment.idGuild)
        if (oldComment.idUser === comment.idUser
            || comment.idUser === guild.idUser
            || await this.rightProvider.moderateComment(comment.idUser)) {
            return this.repository.removeComment(comment.id)
        }
        return Promise.reject('Нет прав')
    }
}

export default GuildProvider