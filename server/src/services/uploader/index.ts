import Hash from '../hash'
import path from 'path'
import fs from 'fs'
import logger from '../logger'

const hash = new Hash()

type FileInfo = {
    url: string
    path: string
}

class Uploader {
    // Подготовить файл к сохранению, сформировать путь и url
    getInfo = (file: any, url: string): FileInfo => {
        url = '/' + url
        const filePath = path.join(__dirname, '../../../upload/' + url)
        const fileName = hash.getHashWithSalt(file.md5) + '.' + file.name.split('.').pop()
        return {
            url: path.join(url, fileName),
            path: path.join(filePath, fileName)
        }
    }

    // Удалить файл
    remove = (url: string) => {
        try {
            fs.unlinkSync(path.join(__dirname, '../../../upload/', url))
        } catch (e) {
            logger.error(e)
        }
    }
}

export default Uploader