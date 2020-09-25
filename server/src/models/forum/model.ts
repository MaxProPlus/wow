import Mapper from '../mappers/forum'
import {CommentForum, CommentStory, Forum} from '../../common/entity/types'
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

        const id = await this.mapper.insert(c)
        c.fileAvatar.mv(infoAvatar.path)
        return id
    }

    // Получить форум по id
    getById = (id: number): Promise<[Forum, CommentForum[]]> => {
        const p: [Promise<Forum>, Promise<CommentForum[]>] = [
            this.mapper.selectById(id),
            this.getComments(id),
        ]
        return Promise.all<Forum, CommentForum[]>(p).then(([s, comments]) => {
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
        if (old.idAccount !== c.idAccount) {
            return Promise.reject('Нет прав')
        }

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
        const oldForum = await this.mapper.selectById(report.id)
        if (oldForum.idAccount !== report.idAccount) {
            return Promise.reject('Нет прав')
        }
        this.uploader.remove(oldForum.urlAvatar)
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