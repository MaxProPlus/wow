import {Option} from "../../../components/myMultiSelect/types"
import {Report} from "../../../../../server/src/common/entity/types"

// Общий state для создание и редактирование
export type CommonS = {
    isLoaded: boolean
    errorMessage: string
    title: string // Полное имя персонажа
    shortDescription: string // Анонс
    description: string // Внешность и характер
    rule: string // Дополнительные сведения
    members: Option[] // Список персонажей-участников
    membersOptions: Option[] // Список персонажей-участников
    guilds: Option[] // Список гильдий-участников
    guildsOptions: Option[] // Список гильдий-участников
    stores: Option[] // Список сюжетов-участников
    storesOptions: Option[] // Список сюжетов-участников

    // Прочее
    closed: number // Закрыть(материал будет доступен только автору)
    hidden: number // Скрыть из общих разделов(материал будет доступен по прямой ссылкуе и для прикрепления к другим материалам)
    comment: number // Запретить комментарии
    style: string // CSS-стили
    coauthors: Option[] // Список соавторов
    coauthorsOptions: Option[] // Список соавторов
}

// Создать FormData из данных
export const handleFormData = (report: Report, avatar: File): FormData => {
    const formData = new FormData()
    formData.append('title', report.title)
    formData.append('shortDescription', report.shortDescription)
    formData.append('description', report.description)
    formData.append('rule', report.rule)
    formData.append('closed', String(report.closed))
    formData.append('hidden', String(report.hidden))
    formData.append('comment', String(report.comment))
    formData.append('fileAvatar', avatar)
    formData.append('style', report.style)
    report.members.forEach(el => {
        formData.append('members', String(el.value))
    })
    report.guilds.forEach(el => {
        formData.append('guilds', String(el.value))
    })
    report.stores.forEach(el => {
        formData.append('stores', String(el.value))
    })
    report.coauthors.forEach(el => {
        formData.append('coauthors', String(el.value))
    })
    return formData
}
