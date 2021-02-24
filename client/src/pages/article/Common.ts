import {Article} from '../../../../server/src/common/entity/types'

// Общий state для создание и редактирование
export type CommonS = {
  isLoaded: boolean
  errorMessage: string

  // Главное
  title: string // Заголовок форума
  shortDescription: string // Анонс

  // Основное
  description: string // Описание форума

  // Прочее
  closed: number // Закрыть(материал будет доступен только автору)
  hidden: number // Скрыть из общих разделов(материал будет доступен по прямой ссылкуе и для прикрепления к другим материалам)
  comment: number // Запретить комментарии
  style: string // CSS-стили
}

// Создать FormData из данных
export const handleFormData = (article: Article, avatar: File): FormData => {
  const formData = new FormData()
  formData.append('title', article.title)
  formData.append('shortDescription', article.shortDescription)
  formData.append('description', article.description)
  formData.append('closed', String(article.closed))
  formData.append('hidden', String(article.hidden))
  formData.append('comment', String(article.comment))
  formData.append('fileAvatar', avatar)
  formData.append('style', article.style)
  return formData
}
