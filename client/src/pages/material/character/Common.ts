import {Option} from '../../../components/myMultiSelect/types'
import {Character} from '../../../../../server/src/common/entity/types'

// Общий state для создание и редактирование
export type CommonS = {
    isLoaded: boolean
    errorMessage: string
    title: string // Полное имя персонажа
    nickname: string // Игровое имя
    shortDescription: string // Девиз персонажа
    race: string // Раса
    nation: string // Народность
    territory: string // Места пребывания
    age: number // Возраст
    className: string // Класс
    occupation: string // Род занятий
    religion: string // Верования
    languages: string // Знание языков
    description: string // Внешность и характер
    history: string // История персонажа
    more: string // Дополнительные сведения
    friends: Option[] // Список друзей
    friendsOptions: Option[] // Список друзей

    // Прочее
    sex: number // Пол. 0 - не указан, 1 - женский, 2 - мужской
    status: number // Статус. 0 - жив, 1 - мертв, 2 - пропал
    active: number // Активность. 0 - отыгрыш еще не начат, 1 - в поиске отыгрыша, 2 - персонаж отыгрывается, 3-отыгрыш завершен
    closed: number // Закрыть(материал будет доступен только автору)
    hidden: number // Скрыть из общих разделов(материал будет доступен по прямой ссылкуе и для прикрепления к другим материалам)
    comment: number // Запретить комментарии
    style: string // CSS-стили
    coauthors: Option[] // Список соавторов
    coauthorsOptions: Option[] // Список соавторов
}

// Создать FormData из данных
export const handleFormData = (character: Character, avatar: File): FormData => {
    const formData = new FormData()
    formData.append('title', character.title)
    formData.append('nickname', character.nickname)
    formData.append('shortDescription', character.shortDescription)
    formData.append('race', character.race)
    formData.append('nation', character.nation)
    formData.append('territory', character.territory)
    formData.append('age', String(character.age))
    formData.append('className', character.className)
    formData.append('occupation', character.occupation)
    formData.append('religion', character.religion)
    formData.append('languages', character.languages)
    formData.append('description', character.description)
    formData.append('history', character.history)
    formData.append('more', character.more)
    formData.append('sex', String(character.sex))
    formData.append('status', String(character.status))
    formData.append('active', String(character.active))
    formData.append('closed', String(character.closed))
    formData.append('hidden', String(character.hidden))
    formData.append('comment', String(character.comment))
    formData.append('fileAvatar', avatar)
    formData.append('style', character.style)
    character.friends.forEach(el => {
        formData.append('friends', String(el.value))
    })
    character.coauthors.forEach(el => {
        formData.append('coauthors', String(el.value))
    })
    return formData
}
