import Mapper from './mapper'
import {Character, CommentStory, Guild, Story} from '../../common/entity/types'
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
        await Promise.all(c.members.map(async (idLink) => {
            await this.mapper.insertMember(id, idLink)
        }))
        await Promise.all(c.guilds.map(async (idLink) => {
            await this.mapper.insertGuild(id, idLink)
        }))
        c.fileAvatar.mv(infoAvatar.path)
        return id
    }

    // Получить сюжет по id
    getById = (id: number): Promise<[Story, CommentStory[]]> => {
        const p: [Promise<Story>, Promise<Character[]>, Promise<Guild[]>, Promise<CommentStory[]>] = [
            this.mapper.selectById(id),
            this.mapper.selectMembersById(id),
            this.mapper.selectGuildsById(id),
            this.getComments(id),
        ]
        return Promise.all<Story, Character[], Guild[], CommentStory[]>(p).then(([s, c, g, comments]) => {
            s.members = c
            s.guilds = g
            return [s, comments]
        })
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
    getByQuery = async (query: any, limit: number, page: number) => {
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
        const old = await this.mapper.selectById(c.id)
        if (old.idAccount !== c.idAccount) {
            return Promise.reject('Нет прав')
        }

        old.members = await this.mapper.selectMembersById(c.id)
        // Перебор нового списка участников сюжета
        await Promise.all(c.members.map(async (el: number) => {
            // Если не находим в старом списке, то добавляем
            if (old.members.findIndex(o => el === o.id) === -1) {
                return await this.mapper.insertMember(c.id, el)
            }
        }))
        // Перебор старого списка участников сюжета
        await Promise.all(old.members.map(async (el: Character) => {
            // Если не находим в новом списке, то удаляем
            if (c.members.indexOf(el.id) === -1) {
                return await this.mapper.removeMember(c.id, el.id)
            }
        }))

        old.guilds = await this.mapper.selectGuildsById(c.id)
        // Перебор нового списка гильдии сюжета
        await Promise.all(c.guilds.map(async (el: number) => {
            // Если не находим в старом списке, то добавляем
            if (old.guilds.findIndex(o => el === o.id) === -1) {
                return await this.mapper.insertGuild(c.id, el)
            }
        }))
        // Перебор старого списка гильдии сюжета
        await Promise.all(old.guilds.map(async (el: Character) => {
            // Если не находим в новом списке, то удаляем
            if (c.guilds.indexOf(el.id) === -1) {
                return await this.mapper.removeGuild(c.id, el.id)
            }
        }))

        // Обновить аватарку
        c.urlAvatar = old.urlAvatar
        let infoAvatar
        if (!!c.fileAvatar) {
            this.uploader.remove(old.urlAvatar)
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