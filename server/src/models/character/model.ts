import Mapper from '../mappers/character'
import {Account, Character, CommentCharacter, Guild, Story} from '../../common/entity/types'
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
        await Promise.all(c.friends.map(async (idLink) => {
            await this.mapper.insertLink(id, idLink)
        }))
        c.fileAvatar.mv(infoAvatar.path)
        return id
    }

    // Получить персонажа по id
    getById = (id: number): Promise<[Character, CommentCharacter[]]> => {
        const p: [Promise<Character>, Promise<Character[]>, Promise<Guild[]>, Promise<Story[]>, Promise<CommentCharacter[]>] = [
            this.mapper.selectById(id),
            this.mapper.selectByIdLink(id),
            this.mapper.selectGuildsById(id),
            this.mapper.selectStoresById(id),
            this.getComments(id),
        ]
        return Promise.all<Character, Character[], Guild[], Story[], CommentCharacter[]>(p).then(([c, links, guilds, stores, comments]) => {
            c.friends = links
            c.guilds = guilds
            c.stores = stores
            return [c, comments]
        }) as Promise<[Character, CommentCharacter[]]>
    }

    // Получить всех персонажей
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

    // Редактировать персонажа
    update = async (c: CharacterUpload) => {
        const oldCharacter = await this.mapper.selectById(c.id)

        oldCharacter.coauthors = await this.mapper.selectCoauthorById(c.id)
        if (oldCharacter.idAccount !== c.idAccount && (oldCharacter.coauthors.findIndex((el: Account) => el.id === c.idAccount)) === -1) {
            return Promise.reject('Нет прав')
        }

        oldCharacter.friends = await this.mapper.selectByIdLink(c.id)
        // Перебор нового списка друзей персонажей
        await Promise.all(c.friends.map(async (el: number) => {
            // Если не находим в старом списке, то добавляем
            if (oldCharacter.friends.findIndex(o => el === o.id) === -1) {
                return await this.mapper.insertLink(c.id, el)
            }
        }))
        // Перебор старого списка друзей персонажей
        await Promise.all(oldCharacter.friends.map(async (el: Character) => {
            // Если не находим в новом списке, то удаляем
            if (c.friends.indexOf(el.id) === -1) {
                return await this.mapper.removeLink(c.id, el.id)
            }
        }))

        c.urlAvatar = oldCharacter.urlAvatar
        let infoAvatar
        // Если загружена новая аватарка, то обновляем ее
        if (!!c.fileAvatar) {
            this.uploader.remove(oldCharacter.urlAvatar)
            infoAvatar = this.uploader.getInfo(c.fileAvatar, 'characterAvatar')
            c.urlAvatar = infoAvatar.url
            c.fileAvatar.mv(infoAvatar.path)
        }

        return this.mapper.update(c)
    }

    // Удалить персонажа
    remove = async (character: Character) => {
        const oldCharacter = await this.mapper.selectById(character.id)
        if (oldCharacter.idAccount !== character.idAccount) {
            return Promise.reject('Нет прав')
        }
        this.uploader.remove(oldCharacter.urlAvatar)
        return this.mapper.remove(character.id)
    }

    // Создать комментарий к персонажу
    createComment = async (comment: CommentCharacter) => {
        const c = await this.mapper.selectById(comment.idCharacter)
        if (!!c.comment || (!!c.closed && c.idAccount !== comment.idAccount)) {
            return Promise.reject('Комментирование запрещено')
        }
        return this.mapper.insertComment(comment)
    }

    // Получить комментарии к персонажу
    getComments = async (id: number): Promise<CommentCharacter[]> => {
        const comments = await this.mapper.selectCommentsByIdCharacter(id)
        comments.forEach((c: CommentCharacter) => {
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