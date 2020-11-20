import StoryRepository from '../../repositories/story'
import {Character, CommentStory, Guild, Report, Story, User} from '../../common/entity/types'
import {defaultAvatar, StoryUpload} from '../../entity/types'
import Uploader from '../../services/uploader'
import RightProvider from '../right'

class StoryProvider {
    private repository: StoryRepository
    private uploader = new Uploader()
    private rightProvider: RightProvider

    constructor(connection: any) {
        this.repository = new StoryRepository(connection.getPoolPromise())
        this.rightProvider = new RightProvider(connection)
    }

    // Создать сюжет
    create = async (c: StoryUpload) => {
        const infoAvatar = this.uploader.getInfo(c.fileAvatar, 'storyAvatar')
        c.urlAvatar = infoAvatar.url

        const id = await this.repository.insert(c)
        const p: Promise<any>[] = []
        p.push(Promise.all(c.members.map((idLink) => {
            return this.repository.insertMember(id, idLink)
        })))
        p.push(Promise.all(c.guilds.map((idLink) => {
            return this.repository.insertGuild(id, idLink)
        })))
        p.push(Promise.all(c.coauthors.map((idLink) => {
            return this.repository.insertGuild(id, idLink)
        })))
        p.push(Promise.all(c.coauthors.map((el: number) => {
            return this.repository.insertCoauthor(id, el)
        })))
        p.push(c.fileAvatar.mv(infoAvatar.path))
        await Promise.all(p)
        return id
    }

    // Получить сюжет по id
    getById = (id: number): Promise<[Story, CommentStory[]]> => {
        const p = [
            this.repository.selectById(id),
            this.repository.selectMembersById(id),
            this.repository.selectGuildsById(id),
            this.repository.selectReportsById(id),
            this.repository.selectCoauthorById(id),
            this.getComments(id),
        ]
        return Promise.all<Story, Character[], Guild[], Report[], User[], CommentStory[]>(p as any).then(([s, members, guilds, reports, coauthors, comments]) => {
            s.members = members
            s.guilds = guilds
            s.reports = reports
            s.coauthors = coauthors
            return [s, comments]
        })
    }

    // Получить все сюжеты
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

    // Редактировать сюжет
    update = async (c: StoryUpload) => {
        const old = (await this.getById(c.id))[0]
        if (old.idUser !== c.idUser && (old.coauthors.findIndex((el: User) => el.id === c.idUser)) === -1) {
            return Promise.reject('Нет прав')
        }

        const p: Promise<any>[] = []

        // Перебор нового списка участников сюжета
        p.push(Promise.all(c.members.map((el: number) => {
            // Если не находим в старом списке, то добавляем
            if (old.members.findIndex(o => el === o.id) === -1) {
                return this.repository.insertMember(c.id, el)
            }
        })))
        // Перебор старого списка участников сюжета
        p.push(Promise.all(old.members.map((el: Character) => {
            // Если не находим в новом списке, то удаляем
            if (c.members.indexOf(el.id) === -1) {
                return this.repository.removeMember(c.id, el.id)
            }
        })))

        // Перебор нового списка гильдии сюжета
        p.push(Promise.all(c.guilds.map((el: number) => {
            // Если не находим в старом списке, то добавляем
            if (old.guilds.findIndex(o => el === o.id) === -1) {
                return this.repository.insertGuild(c.id, el)
            }
        })))
        // Перебор старого списка гильдии сюжета
        p.push(Promise.all(old.guilds.map((el: Character) => {
            // Если не находим в новом списке, то удаляем
            if (c.guilds.indexOf(el.id) === -1) {
                return this.repository.removeGuild(c.id, el.id)
            }
        })))

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
        if (!!c.fileAvatar) {
            this.uploader.remove(old.urlAvatar)
            infoAvatar = this.uploader.getInfo(c.fileAvatar, 'storyAvatar')
            c.urlAvatar = infoAvatar.url
            p.push(c.fileAvatar.mv(infoAvatar.path))
        }
        await Promise.all(p)
        return this.repository.update(c)
    }

    // Удалить сюжет
    remove = async (story: Story) => {
        const old = await this.repository.selectById(story.id)
        old.coauthors = await this.repository.selectCoauthorById(story.id)
        if (old.idUser !== story.idUser && (old.coauthors.findIndex((el: User) => el.id === story.idUser)) === -1) {
            return Promise.reject('Нет прав')
        }
        this.uploader.remove(old.urlAvatar)
        return this.repository.remove(story.id)
    }

    // Создать комментарий
    createComment = async (comment: CommentStory) => {
        const c = await this.repository.selectById(comment.idStory)
        if (!!c.comment || (!!c.closed && c.idUser !== comment.idUser)) {
            return Promise.reject('Комментирование запрещено')
        }
        return this.repository.insertComment(comment)
    }

    // Получить комментарии
    getComments = async (id: number) => {
        const comments = await this.repository.selectCommentsByIdStory(id)
        comments.forEach((c: CommentStory) => {
            if (!c.authorUrlAvatar) {
                c.authorUrlAvatar = defaultAvatar
            }
        })
        return comments
    }

    // Удалить комментарий
    removeComment = async (comment: CommentStory) => {
        const oldComment = await this.repository.selectCommentById(comment.id)
        const story = await this.repository.selectById(oldComment.idStory)
        if (oldComment.idUser === comment.idUser
            || comment.idUser === story.idUser
            || await this.rightProvider.commentModerator(comment.idUser)) {
            return this.repository.removeComment(comment.id)
        }
        return Promise.reject('Нет прав')
    }
}

export default StoryProvider