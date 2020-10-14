import {Option} from "../../../components/myMultiSelect/types"
import {Forum} from "../../../../../server/src/common/entity/types"

// Общий state для создание и редактирование
export type CommonS = {
    isLoaded: boolean
    errorMessage: string

    // Главное
    title: string // Заголовок форума
    shortDescription: string // Анонс

    // Основное
    description: string // Описание форума
    rule: string // Важная информация

    // Прочее
    closed: number // Закрыть(материал будет доступен только автору)
    hidden: number // Скрыть из общих разделов(материал будет доступен по прямой ссылкуе и для прикрепления к другим материалам)
    comment: number // Запретить комментарии
    style: string // CSS-стили
    coauthors: Option[] // Список соавторов
    coauthorsOptions: Option[] // Список соавторов
}

// Создать FormData из данных
export const handleFormData = (forum: Forum, avatar: File): FormData => {
    const formData = new FormData()
    formData.append('title', forum.title)
    formData.append('shortDescription', forum.shortDescription)
    formData.append('description', forum.description)
    formData.append('rule', forum.rule)
    formData.append('closed', String(forum.closed))
    formData.append('hidden', String(forum.hidden))
    formData.append('comment', String(forum.comment))
    formData.append('fileAvatar', avatar)
    formData.append('style', forum.style)
    forum.coauthors.forEach(el => {
        formData.append('coauthors', String(el.value))
    })
    return formData
}
