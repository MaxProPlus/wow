import {UploadedFile} from 'express-fileupload'

export class Account {
    id = 0
    username = ''
    email = ''
    nickname = ''
    urlAvatar = ''
    password = ''
    passwordRepeat = ''
    rights = []
}

export class UserPassword {
    id = 0
    username = ''
    password = ''
    passwordRepeat = ''
    passwordAccept = ''
}

export class Comment {
    id = 0
    text = ''
    idTicket = 0
    idAccount = 0
    authorNickname = ''
    authorUrlAvatar = ''
}

export class Ticket {
    id = 0
    title = ''
    text = ''
    status = TicketStatus.START
    idTicketType = 0
    idAccount = 0
    userNickname = ''
    moderNickname = ''
}

export class TicketType {
    id = 0
    title = ''
    description = ''
    urlIcon = ''
}

export enum TicketStatus {
    START = 0, // новая
    PROGRESS = 1, // в процессе
    CLOSE = 9, // закрыто
}
export function ticketStatusToString(status: number) {
    switch (status) {
        case 0: return 'Открыт'
        case 1: return 'Взято на обработку'
        case 9: return 'Закрыт'
    }
}
