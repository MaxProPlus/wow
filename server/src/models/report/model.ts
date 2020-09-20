import Mapper from './mapper'
import {Character, CommentReport, CommentStory, Report} from '../../common/entity/types'
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
        c.fileAvatar.mv(infoAvatar.path)
        return id
    }

    // Получить отчет по id
    getById = (id: number): Promise<[Report, CommentReport[]]> => {
        const p: [Promise<Report>, Promise<Character[]>, Promise<CommentReport[]>] = [
            this.mapper.selectById(id),
            this.mapper.selectMembersById(id),
            this.getComments(id),
        ]
        return Promise.all<Report, Character[], CommentReport[]>(p).then(([s, c, comments]) => {
            s.members = c
            return [s, comments]
        })
    }

    // Получить все отчеты
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

    // Получить отчеты по запросу
    getByQuery = async (data: any, limit: number, page: number) => {
        const p = []
        p.push(this.mapper.selectByQuery(data, limit, page))
        p.push(this.mapper.selectCountByQuery(data))
        const r = await Promise.all(p)
        return {
            data: r[0],
            count: r[1],
        }
    }

    // Редактировать отчет
    update = async (c: ReportUpload) => {
        const old = await this.mapper.selectById(c.id)
        if (old.idAccount !== c.idAccount) {
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
        const oldReport = await this.mapper.selectById(report.id)
        if (oldReport.idAccount !== report.idAccount) {
            return Promise.reject('Нет прав')
        }
        this.uploader.remove(oldReport.urlAvatar)
        return this.mapper.remove(report.id)
    }

    // Создать комментарий
    createComment = async (comment: CommentReport) => {
        const c = await this.mapper.selectById(comment.idReport)
        if (!!c.comment || (!!c.closed && c.idAccount !== comment.idAccount)) {
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