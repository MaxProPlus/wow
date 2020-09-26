import Mapper from '../mappers/forum'
import {Account, CommentForum, CommentStory, Forum} from '../../common/entity/types'
import {defaultAvatar, ForumUpload} from '../../entity/types'
import Uploader from '../../services/uploader'

class ForumModel {
    private mapper: Mapper
    private uploader = new Uploader()

    constructor(connection: any) {
        this.mapper = new Mapper(connection.getPoolPromise())
    }

    // Создать форум
    create = async (c: ForumUpload) => {
        const infoAvatar = this.uploader.getInfo(c.fileAvatar, 'forumAvatar')
        c.urlAvatar = infoAvatar.url

        await Promise.all(c.coauthors.map(async (el: number) => {
            return this.mapper.insertCoauthor(id, el)
        }))

        const id = await this.mapper.insert(c)
        c.fileAvatar.mv(infoAvatar.path)
        return id
    }

    // Получить форум по id
    getById = (id: number): Promise<[Forum, CommentForum[]]> => {
        const p: [Promise<Forum>, Promise<Account[]>, Promise<CommentForum[]>] = [
            this.mapper.selectById(id),
            this.mapper.selectCoauthorById(id),
            this.getComments(id),
        ]
        return Promise.all<Forum, Account[], CommentForum[]>(p).then(([s, coauthors, comments]) => {
            s.coauthors = coauthors
            return [s, comments]
        })
    }

    // Получить все форумы
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

    // Редактировать форум
    update = async (c: ForumUpload) => {
        const old = await this.mapper.selectById(c.id)

        old.coauthors = await this.mapper.selectCoauthorById(c.id)
        if (old.idAccount !== c.idAccount && (old.coauthors.findIndex((el: Account) => el.id === c.idAccount)) === -1) {
            return Promise.reject('Нет прав')
        }

        // Перебор нового списка соавторов
        await Promise.all(c.coauthors.map(async (el: number) => {
            // Если не находим в старом списке, то добавляем
            if (old.coauthors.findIndex(o => el === o.id) === -1) {
                return await this.mapper.insertCoauthor(c.id, el)
            }
        }))
        // Перебор старого списка соавторов
        await Promise.all(old.coauthors.map(async (el: Account) => {
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

    // Удалить форум
    remove = async (report: Forum) => {
        const old = await this.mapper.selectById(report.id)
        old.coauthors = await this.mapper.selectCoauthorById(report.id)
        if (old.idAccount !== report.idAccount && (old.coauthors.findIndex((el: Account) => el.id === report.idAccount)) === -1) {
            return Promise.reject('Нет прав')
        }
        this.uploader.remove(old.urlAvatar)
        return this.mapper.remove(report.id)
    }

    // Создать комментарий
    createComment = async (comment: CommentForum) => {
        const c = await this.mapper.selectById(comment.idForum)
        if (!!c.comment || (!!c.closed && c.idAccount !== comment.idAccount)) {
            return Promise.reject('Комментирование запрещено')
        }
        return this.mapper.insertComment(comment)
    }

    // Получить комментарии
    getComments = async (id: number) => {
        const comments = await this.mapper.selectCommentsByIdForum(id)
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

export default ForumModel