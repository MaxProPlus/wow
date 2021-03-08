import Hash from '../hash'
import path from 'path'
import fs from 'fs'
import {UploadedFile} from 'express-fileupload'
import {FSError} from '../../errors'
import {Logger} from 'winston'

// Класс для загрузки и удаления изображений
class Uploader {
  constructor(private hash: Hash, private logger: Logger) {}

  // Загрузить файл и вернуть url файла
  move = async (file: UploadedFile, folderName: string): Promise<string> => {
    // console.log(file)
    folderName = '/uploads/' + folderName

    // Путь в системе
    const filePath = path.join(__dirname, '../../..', folderName)

    // Название файла
    let fileName = this.hash.getHashWithSalt(file.md5) + '.'
    switch (file.mimetype) {
      case 'image/jpeg':
        fileName += 'jpg'
        break
      case 'image/webp':
        fileName += 'webp'
        break
      case 'image/png':
        fileName += 'png'
        break
      default:
        fileName += 'png'
    }

    try {
      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, {mode: '0755', recursive: true})
      }
      await file.mv(path.join(filePath, fileName))
    } catch (e) {
      this.logger.error('Ошибка файловой системы: ', e)
      throw new FSError()
    }

    return path.join(folderName, fileName)
  }

  // Удалить файл
  remove = (url: string) => {
    try {
      fs.unlinkSync(path.join(__dirname, '../../../', url))
    } catch (e) {
      this.logger.error(e)
    }
  }
}

export default Uploader
