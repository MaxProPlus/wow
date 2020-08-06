import {Account, Character, Comment, Ticket, UserPassword} from '../entity/types'
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
        let err = ''
        const type = 'mimetype' in file ? file.mimetype : file.type
        switch (type) {
            case 'image/jpeg':
            case 'image/png':
            case 'image/webp':
                break
            default:
                err += 'Не поддерживаемый тип изображения. Поддерживаемые форматы: jpeg, png, webp.\n'
        }
        return err
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

    // Валидация персонажа
    validateCharacter = (character: Character) => {
        let err = '';
        (['title', 'nickname', 'race', 'nation', 'territory', 'className', 'occupation', 'religion', 'languages'] as string[]).forEach(((el: string) => {
            // @ts-ignore
            character[el] = this.trim(character[el])
        }))
        if (character.title.length < 3 || character.title.length > 35) {
            err += 'Длина полного имя персонажа должна быть от 3 до 35 символов.\n'
        }
        if (character.nickname.length < 3 || character.nickname.length > 35) {
            err += 'Длина игрового имени должна быть от 3 до 35 символов.\n'
        }
        if (character.race.length < 3 || character.race.length > 35) {
            err += 'Длина названия расы должна быть от 3 до 35 символов.\n'
        }
        if (character.nation.length > 35) {
            err += 'Длина названия народности не должна первышать 35 символов.\n'
        }
        if (character.territory.length > 50) {
            err += 'Длина названия мест пребывания не должна первышать 50 символов.\n'
        }
        if (character.className.length > 35) {
            err += 'Длина названия класса персонажа не должна первышать 35 символов.\n'
        }
        if (character.occupation.length > 35) {
            err += 'Длина названия рода занятий не должна первышать 35 символов.\n'
        }
        if (character.religion.length > 35) {
            err += 'Длина названия верования не должна первышать 35 символов.\n'
        }
        if (character.languages.length > 35) {
            err += 'Длина названия знание языков не должна первышать 35 символов.\n'
        }
        if (character.shortDescription.length > 100) {
            err += 'Длина девиза не должна первышать 100 символов.\n'
        }
        if (character.description.length < 1) {
            err += 'Описание обязательно для заполнения.\n'
        }
        if (character.sex < 0 || character.sex > 2) {
            err += ''
        }
        if (character.status < 0 || character.status > 3) {
            err += 'Ошибка со статусом'
        }
        if (character.active < 0 || character.active > 3) {
            err += 'Ошибка с активностью'
        }
        if (character.closed < 0 || character.closed > 1) {
            err += 'Ошибка closed'
        }
        if (character.hidden < 0 || character.hidden > 1) {
            err += 'Ошибка hidden'
        }
        if (character.comment < 0 || character.comment > 1) {
            err += 'Ошибка comment'
        }

        return err
    }
}

export default Validator