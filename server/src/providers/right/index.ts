import RightRepository from '../../repositories/right'

export enum Rights {
  TICKET_MODERATOR = 'TICKET_MODERATOR', // Модерация тикетов
  FEEDBACK_MODERATOR = 'FEEDBACK_MODERATOR', // Модерация списка администраторов
  ARTICLE_MODERATOR = 'ARTICLE_MODERATOR', // Модерация новостей
  COMMENT_MODERATOR = 'COMMENT_MODERATOR', // Модерация комментариев
}

class RightProvider {
  constructor(private repository: RightRepository) {}

  // Проверка определенного права
  checkRight = (right: Rights, idUser: number) => {
    return this.repository.checkRight('TICKET_MODERATOR', idUser)
  }

  // Получить все права
  getRights = (id: number): Promise<string[]> => {
    return this.repository.selectRights(id)
  }
}

export default RightProvider
