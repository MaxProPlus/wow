import Hash from '../hash'
import path from 'path'
import fs from 'fs'
import logger from '../logger'

// Возращаемый тип getInfo для дальшейшего перемещения и сохранения в бд
type FileInfo = {
    url: string // url путь для доступа к картинке
    path: string // физический путь до картинки
}

// Класс для загрузки и удаления изображений
class Uploader {
    private hash = new Hash()

    // Подготовить файл к сохранению, сформировать путь и url
    getInfo = (file: any, folderName: string): FileInfo => {
        folderName = '/' + folderName
        const filePath = path.join(__dirname, '../../../upload/' + folderName)
        const fileName = this.hash.getHashWithSalt(file.md5) + '.' + file.name.split('.').pop()
        return {
            url: path.join(folderName, fileName),
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