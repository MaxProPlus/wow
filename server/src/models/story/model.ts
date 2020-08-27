import Mapper from './mapper'
import {CommentStory, Story} from '../../common/entity/types'
import {defaultAvatar, StoryUpload} from '../../entity/types'
import Uploader from '../../services/uploader'

class StoryModel {
    private mapper: Mapper
    private uploader = new Uploader()

    constructor(connection: any) {
        this.mapper = new Mapper(connection.getPoolPromise())
    }

    // Создать сюжет
    create = async (c: StoryUpload) => {
        const infoAvatar = this.uploader.getInfo(c.fileAvatar, 'storyAvatar')
        c.urlAvatar = infoAvatar.url

        const id = await this.mapper.insert(c)
        c.fileAvatar.mv(infoAvatar.path)
        return id
    }

    // Получить сюжет по id
    getById = (id: number): Promise<[Story, CommentStory]> => {
        const p = []
        p.push(this.mapper.selectById(id))
        p.push(this.getComments(id))
        return Promise.all(p) as Promise<[Story, CommentStory]>
    }

    // Получить все сюжеты
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

    // Получить сюжеты по запросу
    getByQuery = async (query: string, limit: number, page: number) => {
        const p = []
        p.push(this.mapper.selectByQuery(query, limit, page))
        p.push(this.mapper.selectCountByQuery(query))
        const r = await Promise.all(p)
        return {
            data: r[0],
            count: r[1],
        }
    }

    // Редактировать сюжет
    update = async (c: StoryUpload) => {
        const oldCharacter = await this.mapper.selectById(c.id)
        if (oldCharacter.idAccount !== c.idAccount) {
            return Promise.reject('Нет прав')
        }
        c.urlAvatar = oldCharacter.urlAvatar
        let infoAvatar
        if (!!c.fileAvatar) {
            this.uploader.remove(oldCharacter.urlAvatar)
            infoAvatar = this.uploader.getInfo(c.fileAvatar, 'storyAvatar')
            c.urlAvatar = infoAvatar.url
            c.fileAvatar.mv(infoAvatar.path)
        }
        return this.mapper.update(c)
    }

    // Удалить сюжет
    remove = async (story: Story) => {
        const oldStory = await this.mapper.selectById(story.id)
        if (oldStory.idAccount !== story.idAccount) {
            return Promise.reject('Нет прав')
        }
        this.uploader.remove(oldStory.urlAvatar)
        return this.mapper.remove(story.id)
    }

    // Создать комментарий
    createComment = async (comment: CommentStory) => {
        const c = await this.mapper.selectById(comment.idStory)
        if (!!c.comment || (!!c.closed && c.idAccount !== comment.idAccount)) {
            return Promise.reject('Комментирование запрещено')
        }
        return this.mapper.insertComment(comment)
    }

    // Получить комментарии
    getComments = async (id: number) => {
        const comments = await this.mapper.selectCommentsByIdStory(id)
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

export default StoryModel