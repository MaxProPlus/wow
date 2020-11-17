import ArticleRepository from '../../repositories/article'
import {Article, CommentArticle} from '../../common/entity/types'
import {ArticleUpload, defaultAvatar} from '../../entity/types'
import Uploader from '../../services/uploader'

class ArticleProvider {
    private repository: ArticleRepository
    private uploader = new Uploader()

    constructor(connection: any) {
        this.repository = new ArticleRepository(connection.getPoolPromise())
    }

    // Создать новость
    create = async (c: ArticleUpload) => {
        const infoAvatar = this.uploader.getInfo(c.fileAvatar, 'articleAvatar')
        c.urlAvatar = infoAvatar.url

        const id = await this.repository.insert(c)
        await c.fileAvatar.mv(infoAvatar.path)
        return id
    }

    // Получить новость по id
    getById = (id: number): Promise<[Article, CommentArticle[]]> => {
        const p: [Promise<Article>, Promise<CommentArticle[]>] = [
            this.repository.selectById(id),
            this.getComments(id),
        ]
        return Promise.all<Article, CommentArticle[]>(p).then(([c, comments]) => {
            return [c, comments]
        }) as Promise<[Article, CommentArticle[]]>
    }

    // Получить все новости
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

    // Редактировать новость
    update = async (c: ArticleUpload) => {
        const oldArticle = await this.repository.selectById(c.id)

        c.urlAvatar = oldArticle.urlAvatar
        let infoAvatar
        // Если загружена новая аватарка, то обновляем ее
        if (!!c.fileAvatar) {
            this.uploader.remove(oldArticle.urlAvatar)
            infoAvatar = this.uploader.getInfo(c.fileAvatar, 'articleAvatar')
            c.urlAvatar = infoAvatar.url
            await c.fileAvatar.mv(infoAvatar.path)
        }

        return this.repository.update(c)
    }

    // Удалить новость
    remove = async (character: Article) => {
        const oldArticle = await this.repository.selectById(character.id)
        if (oldArticle.idUser !== character.idUser) {
            return Promise.reject('Нет прав')
        }
        this.uploader.remove(oldArticle.urlAvatar)
        return this.repository.remove(character.id)
    }

    // Создать комментарий к новости
    createComment = async (comment: CommentArticle) => {
        const c = await this.repository.selectById(comment.idArticle)
        if (!!c.comment || (!!c.closed && c.idUser !== comment.idUser)) {
            return Promise.reject('Комментирование запрещено')
        }
        return this.repository.insertComment(comment)
    }

    // Получить комментарии к новости
    getComments = async (id: number): Promise<CommentArticle[]> => {
        const comments = await this.repository.selectCommentsByIdArticle(id)
        comments.forEach((c: CommentArticle) => {
            if (!c.authorUrlAvatar) {
                c.authorUrlAvatar = defaultAvatar
            }
        })
        return comments
    }

    // Удалить комментарий
    removeComment = (id: number) => {
        return this.repository.removeComment(id)
    }
}

export default ArticleProvider