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
    idAccount = 0
    authorNickname = ''
    authorUrlAvatar = ''
}

export class CommentTicket extends Comment {
    idTicket = 0
}

export class CommentCharacter extends Comment {
    idCharacter = 0
}

export class CommentGuild extends Comment {
    idGuild = 0
}

export class CommentStory extends Comment {
    idStory = 0
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
        case 0:
            return 'Открыт'
        case 1:
            return 'Взято на обработку'
        case 9:
            return 'Закрыт'
        default:
            return ''
    }
}

export class Character {
    id = 0
    idAccount = 0
    urlAvatar = ''
    title = '' // Полное имя персонажа
    nickname = '' // Игровое имя
    shortDescription = '' // Девиз персонажа
    race = '' // Раса
    nation = '' // Народность
    territory = '' // Места пребывания
    age = 0 // Возраст
    className = '' // Класс
    occupation = '' // Род занятий
    religion = '' // Верования
    languages = '' // Знание языков
    description = '' // Внешность и характер
    history = '' // История персонажа
    more = '' // Дополнительные сведения
    chars = [] // Список друзей

    // Прочее
    sex = 0 // Пол. 0 - не указан, 1 - женский, 2 - мужской
    status = 0 // Статус. 0 - жив, 1 - мертв, 2 - пропалб 3-нежить
    active = 0 // Активность. 0 - отыгрыш еще не начат, 1 - в поиске отыгрыша, 2 - персонаж отыгрывается, 3-отыгрыш завершен
    closed = 0 // Закрыть(материал будет доступен только автору)
    hidden = 0 // Скрыть из общих разделов(материал будет доступен по прямой ссылкуе и для прикрепления к другим материалам)
    comment = 0 // Запретить комментарии
    style = '' // CSS-стили
    coauthors = [] // Список соавторов
    activeToString = ()=>{
        switch (this.active) {
            case 0:
                return 'отыгрыш еще не начат'
            case 1:
                return 'в поиске отыгрыша'
            case 2:
                return 'персонаж отыгрывается'
            case 3:
                return 'отыгрыш завершен'
            default:
                return ''
        }
    }
}

export enum Sex {
    NONE = 0, // не указан
    WOMAN = 1, // женский
    MAN = 2, // мужской
}

export enum CharacterStatus {
    ALIVE = 0, // жив
    DEAD = 1, // мертв
    GONE = 2, // пропал
    UNDEAD = 3, // нежить
}

export enum CharacterActive {
    NOT_STARTED = 0, // отыгрыш еще не начат
    SEARCH = 1, // в поиске отыгрыша
    RECOUPED = 2, // персонаж отыгрывается
    COMPLETED = 3, // отыгрыш завершен
}

export function sexToString(sex: number): string {
    switch (sex) {
        case 0:
            return 'не указан'
        case 1:
            return 'женский'
        case 2:
            return 'мужской'
        default:
            return ''
    }
}

export function characterStatusToString(status: number) {
    switch (status) {
        case 0:
            return 'жив'
        case 1:
            return 'мертв'
        case 2:
            return 'пропал'
        case 3:
            return 'нежить'
        default:
            return ''
    }
}

export function characterActiveToString(active: number) {
    switch (active) {
        case 0:
            return 'отыгрыш еще не начат'
        case 1:
            return 'в поиске отыгрыша'
        case 2:
            return 'персонаж отыгрывается'
        case 3:
            return 'отыгрыш завершен'
        default:
            return ''
    }
}

// Гильдия
export class Guild {
    id = 0
    idAccount = 0
    urlAvatar = '' // avatar

    // Главное
    title = '' // Название гильдии
    gameTitle = '' // Название гильдии в игре
    ideology = '' // Мировозрение
    shortDescription = '' // Анонс

    // Основное
    description = '' // Описание и история
    rule = '' // Условия и правила
    more = '' // Дополнительные сведения
    articles = [] // Список обсуждений/статей/логов
    members = [] // Список участников
    events = [] // Список событий

    // Прочее
    status = 0 // Статус. 0 - активна, 1 - скоро открытие, 2 - распущена
    kit = 0 // Набор. 0 - открыт, 1 - закрыт, 2 - временно прекращен
    style = '' // CSS-стили
    coauthors = [] // Список соавторов
    closed = 0 // Закрыть(материал будет доступен только автору)
    hidden = 0 // Скрыть из общих разделов(материал будет доступен по прямой ссылкуе и для прикрепления к другим материалам)
    comment = 0 // Запретить комментарии
}

export function guildStatusToString(active: number) {
    switch (active) {
        case 0:
            return 'активна'
        case 1:
            return 'скоро открытие'
        case 2:
            return 'распущена'
        default:
            return ''
    }
}

export function guildKitToString(active: number) {
    switch (active) {
        case 0:
            return 'открыт'
        case 1:
            return 'закрыт'
        case 2:
            return 'временно прекращен'
        default:
            return ''
    }
}

// Сюжет
export class Story {
    id = 0
    idAccount = 0
    urlAvatar = '' // avatar

    // Главное
    title = '' // Название гильдии
    dateStart = '' // Дата начала
    period = '' // Планируемый период отыгрыша
    shortDescription = '' // Анонс

    // Основное
    description = '' // Описание сюжета
    rule = '' // Условия и правила
    more = '' // Дополнительные сведения
    articles = [] // Список обсуждений/статей/логов
    members = [] // Список персонажей-участников
    guilds = [] // Список гильдий
    events = [] // Список событий

    // Прочее
    status = 0 // Статус. 0 - еще не начат, 1 - активен, 2 - отложен, 3 - завершен
    style = '' // CSS-стили
    coauthors = [] // Список соавторов
    closed = 0 // Закрыть(материал будет доступен только автору)
    hidden = 0 // Скрыть из общих разделов(материал будет доступен по прямой ссылкуе и для прикрепления к другим материалам)
    comment = 0 // Запретить комментарии
}

export function storyStatusToString(status: number) {
    switch (status) {
        case 0:
            return 'еще не начат'
        case 1:
            return 'активен'
        case 2:
            return 'отложен'
        case 3:
            return 'завершен'
        default:
            return ''
    }
}



export const defaultCharacterAvatar = '/characterAvatar/standard.png'
export const defaultGuildAvatar = '/guildAvatar/standard.png'
export const defaultStoryAvatar = '/storyAvatar/standard.png'
