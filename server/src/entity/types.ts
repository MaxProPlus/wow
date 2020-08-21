import {Character, Guild, Story} from '../common/entity/types'
import {UploadedFile} from 'express-fileupload'

export const defaultAvatar = '/avatar/standart.png'

export class Token {
    id = 0
    idAccount = 0
    text = ''
    ip = ''
}

export class About {
    ip = ''
}

export class UserAuth {
    id = 0
    username = ''
}

export class CharacterUpload extends Character {
    fileAvatar!:UploadedFile
}

export class GuildUpload extends Guild {
    fileAvatar!:UploadedFile
}

export class StoryUpload extends Story {
    fileAvatar!:UploadedFile
}