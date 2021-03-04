import {
  Article,
  Character,
  Forum,
  Guild,
  Report,
  Story,
} from '../common/entity/types'
import {UploadedFile} from 'express-fileupload'

export class Token {
  id = 0
  idUser = 0
  text = ''
  ip = ''
}

export class About {
  ip = ''
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

export class ArticleUpload extends Article {
  fileAvatar!: UploadedFile
}
