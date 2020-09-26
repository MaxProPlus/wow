import Mapper from '../mappers/story'
import {Account, Character, CommentStory, Guild, Story} from '../../common/entity/types'
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
            return this.mapper.insertMember(id, idLink)
        }))
        await Promise.all(c.guilds.map(async (idLink) => {
            return this.mapper.insertGuild(id, idLink)
        }))
        await Promise.all(c.coauthors.map(async (idLink) => {
            return this.mapper.insertGuild(id, idLink)
        }))
        await Promise.all(c.coauthors.map(async (el: number) => {
            return this.mapper.insertCoauthor(id, el)
        }))
        c.fileAvatar.mv(infoAvatar.path)
        return id
    }

    // Получить сюжет по id
    getById = (id: number): Promise<[Story, CommentStory[]]> => {
        const p: [Promise<Story>, Promise<Character[]>, Promise<Guild[]>, Promise<Account[]>, Promise<CommentStory[]>] = [
            this.mapper.selectById(id),
            this.mapper.selectMembersById(id),
            this.mapper.selectGuildsById(id),
            this.mapper.selectCoauthorById(id),
            this.getComments(id),
        ]
        return Promise.all<Story, Character[], Guild[], Account[], CommentStory[]>(p).then(([s, c, g, a, comments]) => {
            s.members = c
            s.guilds = g
            s.coauthors = a
            return [s, comments]
        })
    }

    // Получить все сюжеты
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

    // Редактировать сюжет
    update = async (c: StoryUpload) => {
        const old = (await this.getById(c.id))[0]
        if (old.idAccount !== c.idAccount && (old.coauthors.findIndex((el: Account) => el.id === c.idAccount)) === -1) {
            return Promise.reject('Нет прав')
        }

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
            infoAvatar = this.uploader.getInfo(c.fileAvatar, 'storyAvatar')
            c.urlAvatar = infoAvatar.url
            c.fileAvatar.mv(infoAvatar.path)
        }
        return this.mapper.update(c)
    }

    // Удалить сюжет
    remove = async (story: Story) => {
        const old = await this.mapper.selectById(story.id)
        old.coauthors = await this.mapper.selectCoauthorById(story.id)
        if (old.idAccount !== story.idAccount && (old.coauthors.findIndex((el: Account) => el.id === story.idAccount)) === -1) {
            return Promise.reject('Нет прав')
        }
        this.uploader.remove(old.urlAvatar)
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