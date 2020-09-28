import {Option} from "../../components/myMultiSelect/types"
import {Guild} from "../../../../server/src/common/entity/types"

// Общий state для создание и редактирование
export type CommonS = {
    isLoaded: boolean
    errorMessage: string

    // Главное
    title: string // Название гильдии
    gameTitle: string // Название гильдии в игре
    ideology: string // Мировозрение
    shortDescription: string // Анонс

    // Основное
    description: string // Описание и история
    rule: string // Условия и правила
    more: string // Дополнительные сведения
    members: any[] // Список участников
    membersOptions: Option[] // Список участников

    // Прочее
    status: number // Статус. 0 - активна, 1 - скоро открытие, 2 - распущена
    kit: number // Набор. 0 - открыт, 1 - закрыт, 2 - временно прекращен
    style: string // CSS-стили
    coauthors: Option[] // Список соавторов
    coauthorsOptions: Option[] // Список соавторов
    closed: number // Закрыть(материал будет доступен только автору)
    hidden: number // Скрыть из общих разделов(материал будет доступен по прямой ссылкуе и для прикрепления к другим материалам)
    comment: number // Запретить комментарии
}

// Создать FormData из данных
export const handleFormData = (guild: Guild, avatar: File): FormData => {
    const formData = new FormData()
    formData.append('fileAvatar', avatar)
    formData.append('title', guild.title)
    formData.append('gameTitle', guild.gameTitle)
    formData.append('ideology', guild.ideology)
    formData.append('shortDescription', guild.shortDescription)
    formData.append('description', guild.description)
    formData.append('rule', guild.rule)
    formData.append('more', guild.more)
    formData.append('status', String(guild.status))
    formData.append('kit', String(guild.kit))
    formData.append('style', guild.style)
    formData.append('closed', String(guild.closed))
    formData.append('hidden', String(guild.hidden))
    formData.append('comment', String(guild.comment))
    guild.members.forEach(el => {
        formData.append('members', String(el.value))
    })
    guild.coauthors.forEach(el => {
        formData.append('coauthors', String(el.value))
    })
    return formData
}