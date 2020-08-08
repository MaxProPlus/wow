import Mapper from './mapper'
import {Character, CommentCharacter, CommentTicket, Ticket, TicketStatus} from '../../common/entity/types'
import {CharacterUpload, defaultAvatar} from '../../entity/types'
import Uploader from '../../services/uploader'

class CharacterModel {
    private mapper: Mapper
    private uploader = new Uploader()

    constructor(connection: any) {
        this.mapper = new Mapper(connection.getPoolPromise())
    }

    // Создать персонажа
    create = async (c: CharacterUpload) => {
        const infoAvatar = this.uploader.getInfo(c.fileAvatar, 'characterAvatar')
        c.urlAvatar = infoAvatar.url

        const id = await this.mapper.insert(c)
        c.fileAvatar.mv(infoAvatar.path)
        return id
    }

    // Получить персонажа по id
    getById = (id: number): Promise<[Character]> => {
        const p = []
        p.push(this.mapper.selectById(id))
        // p.push(this.getComments(id))
        return Promise.all(p) as Promise<[Character]>
    }

    // Получить всех персонажей
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

    // Редактировать персонажа
    update =async (c: CharacterUpload) => {
        const oldCharacter = await this.mapper.selectById(c.id)
        if (oldCharacter.idAccount !== c.idAccount) {
            return Promise.reject('Нет прав')
        }
        c.urlAvatar = oldCharacter.urlAvatar
        let infoAvatar
        if (!!c.fileAvatar) {
            this.uploader.remove(oldCharacter.urlAvatar)
            infoAvatar = this.uploader.getInfo(c.fileAvatar, 'characterAvatar')
            c.urlAvatar = infoAvatar.url
            c.fileAvatar.mv(infoAvatar.path)
        }
        return this.mapper.update(c)
    }

    // Удалить персонажа
    remove = (id: number) => {
        return this.mapper.remove(id)
    }

    // Создать комментарий к персонажу
    createComment = async (comment: CommentCharacter) => {
        return this.mapper.insertComment(comment)
    }

    // Получить комментарии к персонажу
    getComments = async (id: number) => {
        const comments = await this.mapper.selectCommentsByIdCharacter(id)
        comments.forEach((c: CommentTicket) => {
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

export default CharacterModel