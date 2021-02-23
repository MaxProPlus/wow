import ForumRepository from '../../repositories/forum'
import {CommentForum, Forum, User} from '../../common/entity/types'
import {defaultAvatar, ForumUpload} from '../../entity/types'
import Uploader from '../../services/uploader'
import RightProvider from '../right'
import {ForbiddenError, NotFoundError} from '../../errors'

// Ошибка "Форум не найден"
export class ForumNotFoundError extends NotFoundError {
    constructor() {
        super('Форум не найден')
    }
}

class ForumProvider {
    constructor(
        private repository: ForumRepository,
        private rightProvider: RightProvider,
        private uploader: Uploader
    ) {
    }

    // Создать форум
    create = async (c: ForumUpload): Promise<number> => {
        const infoAvatar = this.uploader.getInfo(c.fileAvatar, 'forumAvatar')
        c.urlAvatar = infoAvatar.url

        await Promise.all(c.coauthors.map(async (el: number) => {
            return this.repository.insertCoauthor(id, el)
        }))

        const id = await this.repository.insert(c)
        await c.fileAvatar.mv(infoAvatar.path)
        return id
    }

    // Получить форум по id
    getById = (id: number): Promise<[Forum, CommentForum[]]> => {
        const p = [
            this.repository.selectById(id),
            this.repository.selectCoauthorById(id),
            this.getComments(id),
        ]
        return Promise.all<Forum, User[], CommentForum[]>(p as any).then(([s, coauthors, comments]) => {
            s.coauthors = coauthors
            return [s, comments]
        })
    }

    // Получить все форумы
    getAll = (limit: number, page: number, data?: any): Promise<{ data: Forum[], count: number }> => {
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

    // Редактировать форум
    update = async (c: ForumUpload): Promise<number> => {
        const old = await this.repository.selectById(c.id)

        old.coauthors = await this.repository.selectCoauthorById(c.id)
        if (old.idUser !== c.idUser && (old.coauthors.findIndex((el: User) => el.id === c.idUser)) === -1) {
            throw new ForbiddenError()
        }

        const p = []

        // Перебор нового списка соавторов
        p.push(Promise.all(c.coauthors.map((el: number) => {
            // Если не находим в старом списке, то добавляем
            if (old.coauthors.findIndex(o => el === o.id) === -1) {
                return this.repository.insertCoauthor(c.id, el)
            }
        })))
        // Перебор старого списка соавторов
        p.push(Promise.all(old.coauthors.map((el: User) => {
            // Если не находим в новом списке, то удаляем
            if (c.coauthors.indexOf(el.id) === -1) {
                return this.repository.removeCoauthor(c.id, el.id)
            }
        })))

        // Обновить аватарку
        c.urlAvatar = old.urlAvatar
        let infoAvatar
        if (c.fileAvatar) {
            this.uploader.remove(old.urlAvatar)
            infoAvatar = this.uploader.getInfo(c.fileAvatar, 'reportAvatar')
            c.urlAvatar = infoAvatar.url
            p.push(c.fileAvatar.mv(infoAvatar.path))
        }
        await Promise.all<any>(p)
        return this.repository.update(c)
    }

    // Удалить форум
    remove = async (report: Forum): Promise<number> => {
        const old = await this.repository.selectById(report.id)
        old.coauthors = await this.repository.selectCoauthorById(report.id)
        if (old.idUser !== report.idUser && (old.coauthors.findIndex((el: User) => el.id === report.idUser)) === -1) {
            throw new ForbiddenError()
        }
        this.uploader.remove(old.urlAvatar)
        return this.repository.remove(report.id)
    }

    // Создать комментарий
    createComment = async (comment: CommentForum): Promise<number> => {
        const c = await this.repository.selectById(comment.idForum)
        if (c.comment || (c.closed && c.idUser !== comment.idUser)) {
            throw new ForbiddenError('Комментирование запрещено')
        }
        return this.repository.insertComment(comment)
    }

    // Получить комментарии
    getComments = async (id: number): Promise<CommentForum[]> => {
        const comments = await this.repository.selectCommentsByIdForum(id)
        comments.forEach((c) => {
            if (!c.authorUrlAvatar) {
                c.authorUrlAvatar = defaultAvatar
            }
        })
        return comments
    }

    // Удалить комментарий
    removeComment = async (comment: CommentForum): Promise<number> => {
        const oldComment = await this.repository.selectCommentById(comment.id)
        const forum = await this.repository.selectById(oldComment.idForum)
        if (oldComment.idUser === comment.idUser
            || comment.idUser === forum.idUser
            || await this.rightProvider.commentModerator(comment.idUser)) {
            return this.repository.removeComment(comment.id)
        }
        throw new ForbiddenError()
    }
}

export default ForumProvider