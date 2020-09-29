import {Character, Forum, Guild, Report, Story} from '../common/entity/types'
import {UploadedFile} from 'express-fileupload'

export const defaultAvatar = '/avatar/standard.png'

export class Token {
    id = 0
    idUser = 0
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
    fileAvatar!: UploadedFile
}

export class GuildUpload extends Guild {
    fileAvatar!: UploadedFile
}

export class StoryUpload extends Story {
    fileAvatar!: UploadedFile
}

export class ReportUpload extends Report {
    fileAvatar!: UploadedFile
}

export class ForumUpload extends Forum {
    fileAvatar!: UploadedFile
}