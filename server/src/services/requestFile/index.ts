import {Request} from 'express'
import {UploadedFile} from 'express-fileupload'

// Объект для получение файлов из запроса
class RequestFile {
  static get = (req: Request, name: string): UploadedFile | null => {
    if (!req.files || Object.keys(req.files).length < 1 || !req.files[name]) {
      return null
    }
    return req.files[name] as UploadedFile
  }
}

export default RequestFile
