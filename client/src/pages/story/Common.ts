import {Story} from "../../../../server/src/common/entity/types"
import {Option} from "../../components/myMultiSelect/types"

// Общий state для создание и редактирование
export type CommonS = {
    isLoaded: boolean
    errorMessage: string

    // Главное
    title: string // Название сюжета
    dateStart: string // Дата начала
    period: string // Мировозрение
    shortDescription: string // Анонс

    // Основное
    description: string // Описание и история
    rule: string // Условия и правила
    more: string // Дополнительные сведения
    articles: Option[] // Список обсуждений/статей/логов
    articlesOptions: Option[] // Список обсуждений/статей/логов
    members: Option[] // Список участников
    membersOptions: Option[] // Список участников
    guilds: Option[] // Список гильдий
    guildsOptions: Option[] // Список гильдий
    events: Option[] // Список событий
    eventsOptions: Option[] // Список событий

    // Прочее
    status: number // Статус. 0 - активна, 1 - скоро открытие, 2 - распущена
    style: string // CSS-стили
    coauthors: Option[] // Список соавторов
    coauthorsOptions: Option[] // Список соавторов
    closed: number // Закрыть(материал будет доступен только автору)
    hidden: number // Скрыть из общих разделов(материал будет доступен по прямой ссылкуе и для прикрепления к другим материалам)
    comment: number // Запретить комментарии
}

// Создать formData из данных
export const handleFormData = (story: Story, avatar: File): FormData => {
    const formData = new FormData()
    formData.append('fileAvatar', avatar)
    formData.append('title', story.title)
    formData.append('dateStart', story.dateStart)
    formData.append('period', story.period)
    formData.append('shortDescription', story.shortDescription)
    formData.append('description', story.description)
    formData.append('rule', story.rule)
    formData.append('more', story.more)
    formData.append('status', String(story.status))
    formData.append('style', story.style)
    formData.append('closed', String(story.closed))
    formData.append('hidden', String(story.hidden))
    formData.append('comment', String(story.comment))
    story.articles.forEach(el => {
        formData.append('articles', String(el.value))
    })
    story.members.forEach(el => {
        formData.append('members', String(el.value))
    })
    story.guilds.forEach(el => {
        formData.append('guilds', String(el.value))
    })
    story.events.forEach(el => {
        formData.append('events', String(el.value))
    })
    story.coauthors.forEach(el => {
        formData.append('coauthors', String(el.value))
    })
    return formData
}
