import {Comment, Ticket, Account, UserPassword} from '../entity/types'
import {UploadedFile} from 'express-fileupload'

class Validator {
    // Удалить лишние пробелы
    trim(s: string) {
        return s.trim().replace(/\s{2,}/g, ' ')
    }

    // Валидация комментария
    validateComment(comment: Comment) {
        let ok = true
        let err = ''
        return {ok, err}
    }

    // Валидация настроек безопасности
    validateSecure(user: Account) {
        let ok = true
        let err = ''
        if (!/^[A-Za-z0-9_-]{3,16}$/.test(user.username)) {
            ok = false
            err += 'Длина логина должна быть от 3 до 16 знаков и должен состоять из цифр, латинских букв, символов - и _.\n'
        }
        if (!/^[A-Z0-9._%+-]+@[A-Z0-9-]+.+.[A-Z]{2,4}$/i.test(user.email)) {
            ok = false
            err += 'Не валидный email.\n'
        }
        return {ok, err}
    }

    // Валидация регистрации
    validateSignup(user: Account) {
        let {ok, err} = this.validateSecure(user)
        if (!/^[A-Za-z0-9_-]{3,16}$/.test(user.password)) {
            ok = false
            err += 'Длина пароля должна быть от 3 до 16 знаков и должен состоять из цифр, прописных и строчных букв, символов - и _.\n'
        }
        if (user.password !== user.passwordRepeat) {
            ok = false
            err += 'Пароли не совпадают.\n'
        }
        return {ok, err}
    }

    // Валидация пароля
    validatePassword(user: UserPassword) {
        let ok = true
        let err = ''
        if (!/^[A-Za-z0-9_-]{3,16}$/.test(user.password)) {
            ok = false
            err += 'Длина пароля должна быть от 3 до 16 знаков и должен состоять из цифр, прописных и строчных букв, символов - и _.\n'
        }
        if (user.password !== user.passwordRepeat) {
            ok = false
            err += 'Пароли не совпадают.\n'
        }
        return {ok, err}
    }

    // Валидация основной информации
    validateGeneral(user: Account) {
        let ok = true
        let err = ''
        user.nickname = this.trim(user.nickname)
        if (user.nickname === '') {
            ok = false
            err += 'Никнейм не может быть пустым.\n'
        }
        if (user.nickname.length > 32) {
            ok = false
            err += 'Никнейм не должен превышать 32 символов.\n'
        }
        return {ok, err}
    }

    // Валидация изображений
    validateImg(file: UploadedFile | File): any {
        let ok = true
        let err = ''
        const type = 'mimetype' in file ? file.mimetype : file.type
        switch (type) {
            case 'image/jpeg':
            case 'image/png':
            case 'image/webp':
                break
            default:
                ok = false
                err += 'Не поддерживаемый тип изображения. Поддерживаемые форматы: jpeg, png, webp.\n'
        }
        return {ok, err}
    }

    // Валидация комментария
    validateTicket = (ticket: Ticket) => {
        let ok = true
        let err = ''
        ticket.text = this.trim(ticket.text)
        if (ticket.title.length < 3 || ticket.title.length > 100) {
            ok = false
            err += 'Длина названия заявки в должна быть от 3 до 100 символов.\n'
        }
        if (ticket.text.length < 3 || ticket.text.length > 150) {
            ok = false
            err += 'Длина текста заявки должна быть от 3 до 150 символов.\n'
        }
        return {ok, err}
    }
}

export default Validator