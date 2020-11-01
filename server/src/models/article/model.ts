import Mapper from '../mappers/article'
import {Article, CommentArticle} from '../../common/entity/types'
import {ArticleUpload, defaultAvatar} from '../../entity/types'
import Uploader from '../../services/uploader'

class ArticleModel {
    private mapper: Mapper
    private uploader = new Uploader()

    constructor(connection: any) {
        this.mapper = new Mapper(connection.getPoolPromise())
    }

    // Создать новость
    create = async (c: ArticleUpload) => {
        const infoAvatar = this.uploader.getInfo(c.fileAvatar, 'articleAvatar')
        c.urlAvatar = infoAvatar.url

        const id = await this.mapper.insert(c)
        c.fileAvatar.mv(infoAvatar.path)
        return id
    }

    // Получить новость по id
    getById = (id: number): Promise<[Article, CommentArticle[]]> => {
        const p: [Promise<Article>, Promise<CommentArticle[]>] = [
            this.mapper.selectById(id),
            this.getComments(id),
        ]
        return Promise.all<Article, CommentArticle[]>(p).then(([c, comments]) => {
            return [c, comments]
        }) as Promise<[Article, CommentArticle[]]>
    }

    // Получить все новости
    getAll = (limit: number, page: number, data?: any) => {
        const p = []
        p.push(this.mapper.selectAll(limit, page, data))
        p.push(this.mapper.selectCount(data))
        return Promise.all(p).then((r) => {
            return {
                data: r[0],
                count: r[1],
            }
        })
    }

    // Редактировать новость
    update = async (c: ArticleUpload) => {
        const oldArticle = await this.mapper.selectById(c.id)

        c.urlAvatar = oldArticle.urlAvatar
        let infoAvatar
        // Если загружена новая аватарка, то обновляем ее
        if (!!c.fileAvatar) {
            this.uploader.remove(oldArticle.urlAvatar)
            infoAvatar = this.uploader.getInfo(c.fileAvatar, 'articleAvatar')
            c.urlAvatar = infoAvatar.url
            c.fileAvatar.mv(infoAvatar.path)
        }

        return this.mapper.update(c)
    }

    // Удалить новость
    remove = async (character: Article) => {
        const oldArticle = await this.mapper.selectById(character.id)
        if (oldArticle.idUser !== character.idUser) {
            return Promise.reject('Нет прав')
        }
        this.uploader.remove(oldArticle.urlAvatar)
        return this.mapper.remove(character.id)
    }

    // Создать комментарий к новости
    createComment = async (comment: CommentArticle) => {
        const c = await this.mapper.selectById(comment.idArticle)
        if (!!c.comment || (!!c.closed && c.idUser !== comment.idUser)) {
            return Promise.reject('Комментирование запрещено')
        }
        return this.mapper.insertComment(comment)
    }

    // Получить комментарии к новости
    getComments = async (id: number): Promise<CommentArticle[]> => {
        const comments = await this.mapper.selectCommentsByIdArticle(id)
        comments.forEach((c: CommentArticle) => {
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

export default ArticleModel