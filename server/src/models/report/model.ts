import Mapper from '../mappers/report'
import {User, Character, CommentReport, CommentStory, Guild, Report, Story} from '../../common/entity/types'
import {defaultAvatar, ReportUpload} from '../../entity/types'
import Uploader from '../../services/uploader'

class ReportModel {
    private mapper: Mapper
    private uploader = new Uploader()

    constructor(connection: any) {
        this.mapper = new Mapper(connection.getPoolPromise())
    }

    // Создать отчет
    create = async (c: ReportUpload) => {
        const infoAvatar = this.uploader.getInfo(c.fileAvatar, 'reportAvatar')
        c.urlAvatar = infoAvatar.url

        const id = await this.mapper.insert(c)
        await Promise.all(c.members.map(async (idLink) => {
            await this.mapper.insertMember(id, idLink)
        }))
        await Promise.all(c.guilds.map(async (idLink) => {
            await this.mapper.insertGuild(id, idLink)
        }))
        await Promise.all(c.stores.map(async (idLink) => {
            await this.mapper.insertStory(id, idLink)
        }))
        await Promise.all(c.coauthors.map(async (el: number) => {
            return this.mapper.insertCoauthor(id, el)
        }))
        c.fileAvatar.mv(infoAvatar.path)
        return id
    }

    // Получить отчет по id
    getById = (id: number): Promise<[Report, CommentReport[]]> => {
        const p: [Promise<Report>, Promise<Character[]>, Promise<Guild[]>, Promise<Story[]>, Promise<User[]>, Promise<CommentReport[]>] = [
            this.mapper.selectById(id),
            this.mapper.selectMembersById(id),
            this.mapper.selectGuildsById(id),
            this.mapper.selectStoresById(id),
            this.mapper.selectCoauthorById(id),
            this.getComments(id),
        ]
        return Promise.all<Report, Character[], Guild[], Story[], User[], CommentReport[]>(p).then(([s, members,guilds, stores, coauthors, comments]) => {
            s.members = members
            s.guilds = guilds
            s.stores = stores
            s.coauthors = coauthors
            return [s, comments]
        })
    }

    // Получить все отчеты
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

    // Редактировать отчет
    update = async (c: ReportUpload) => {
        const old = await this.mapper.selectById(c.id)
        old.coauthors = await this.mapper.selectCoauthorById(c.id)
        if (old.idUser !== c.idUser && (old.coauthors.findIndex((el: User) => el.id === c.idUser)) === -1) {
            return Promise.reject('Нет прав')
        }

        old.members = await this.mapper.selectMembersById(c.id)
        // Перебор нового списка участников отчета
        await Promise.all(c.members.map(async (el: number) => {
            // Если не находим в старом списке, то добавляем
            if (old.members.findIndex(o => el === o.id) === -1) {
                return await this.mapper.insertMember(c.id, el)
            }
        }))
        // Перебор старого списка участников отчета
        await Promise.all(old.members.map(async (el: Character) => {
            // Если не находим в новом списке, то удаляем
            if (c.members.indexOf(el.id) === -1) {
                return await this.mapper.removeMember(c.id, el.id)
            }
        }))

        old.guilds = await this.mapper.selectGuildsById(c.id)
        // Перебор нового списка гильдий отчета
        await Promise.all(c.guilds.map(async (el: number) => {
            // Если не находим в старом списке, то добавляем
            if (old.guilds.findIndex(o => el === o.id) === -1) {
                return await this.mapper.insertGuild(c.id, el)
            }
        }))
        // Перебор старого списка гильдий отчета
        await Promise.all(old.guilds.map(async (el: Character) => {
            // Если не находим в новом списке, то удаляем
            if (c.guilds.indexOf(el.id) === -1) {
                return await this.mapper.removeGuild(c.id, el.id)
            }
        }))

        old.stores = await this.mapper.selectStoresById(c.id)
        // Перебор нового списка участников отчета
        await Promise.all(c.stores.map(async (el: number) => {
            // Если не находим в старом списке, то добавляем
            if (old.stores.findIndex(o => el === o.id) === -1) {
                return await this.mapper.insertStory(c.id, el)
            }
        }))
        // Перебор старого списка участников отчета
        await Promise.all(old.stores.map(async (el: Character) => {
            // Если не находим в новом списке, то удаляем
            if (c.stores.indexOf(el.id) === -1) {
                return await this.mapper.removeStory(c.id, el.id)
            }
        }))

        // Перебор нового списка соавторов
        await Promise.all(c.coauthors.map(async (el: number) => {
            // Если не находим в старом списке, то добавляем
            if (old.coauthors.findIndex(o => el === o.id) === -1) {
                return await this.mapper.insertCoauthor(c.id, el)
            }
        }))
        // Перебор старого списка соавторов
        await Promise.all(old.coauthors.map(async (el: User) => {
            // Если не находим в новом списке, то удаляем
            if (c.coauthors.indexOf(el.id) === -1) {
                return await this.mapper.removeCoauthor(c.id, el.id)
            }
        }))

        // Обновить аватарку
        c.urlAvatar = old.urlAvatar
        let infoAvatar
        if (!!c.fileAvatar) {
            this.uploader.remove(old.urlAvatar)
            infoAvatar = this.uploader.getInfo(c.fileAvatar, 'reportAvatar')
            c.urlAvatar = infoAvatar.url
            c.fileAvatar.mv(infoAvatar.path)
        }
        return this.mapper.update(c)
    }

    // Удалить отчет
    remove = async (report: Report) => {
        const old = await this.mapper.selectById(report.id)
        old.coauthors = await this.mapper.selectCoauthorById(report.id)
        if (old.idUser !== report.idUser && (old.coauthors.findIndex((el: User) => el.id === report.idUser)) === -1) {
            return Promise.reject('Нет прав')
        }
        this.uploader.remove(old.urlAvatar)
        return this.mapper.remove(report.id)
    }

    // Создать комментарий
    createComment = async (comment: CommentReport) => {
        const c = await this.mapper.selectById(comment.idReport)
        if (!!c.comment || (!!c.closed && c.idUser !== comment.idUser)) {
            return Promise.reject('Комментирование запрещено')
        }
        return this.mapper.insertComment(comment)
    }

    // Получить комментарии
    getComments = async (id: number) => {
        const comments = await this.mapper.selectCommentsByIdReport(id)
        comments.forEach((c: CommentStory) => {
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

export default ReportModel