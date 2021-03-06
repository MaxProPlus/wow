import {
  User,
  Character,
  Comment,
  Forum,
  Guild,
  Report,
  Story,
  Ticket,
  UserPassword,
  Article,
} from '../entity/types'
import {UploadedFile} from 'express-fileupload'

class Validator {
  // Удалить лишние пробелы
  trim = (s: string) => {
    return s.trim().replace(/\s{2,}/g, ' ')
  }

  // Удалить лишние пробелы у обекта по ключам
  trimObject = (obj: any, list: string[]) => {
    list.forEach((el: string) => {
      obj[el] = this.trim(obj[el])
    })
  }

  // Нормализовать передаваемые данные id к массиву типа number
  normalize(obj: any, list: string[]) {
    list.forEach((el: string) => {
      switch (typeof obj[el]) {
        case 'undefined':
          obj[el] = []
          break
        case 'string':
          obj[el] = [+obj[el]]
          break
        case 'object':
          if (typeof obj[el][0] === 'string') {
            obj[el] = obj[el].map((el: string) => +el)
          }
          break
      }
    })
  }

  // Валидация комментария
  validateComment(comment: Comment) {
    let err = ''
    if (comment.text.length < 3) {
      err += 'Длина комментария не должна быть меньше 3 символов'
    }
    return err
  }

  // Валидация настроек безопасности
  validateEmail(user: User) {
    let err = ''
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9-]+.+.[A-Z]{2,4}$/i.test(user.email)) {
      err += 'Не валидный email.\n'
    }
    return err
  }

  // Валидация регистрации
  validateSignup(user: User) {
    let err = this.validateEmail(user)
    if (!/^[A-Za-z0-9_-]{3,16}$/.test(user.username)) {
      err +=
        'Длина логина должна быть от 3 до 16 знаков и должен состоять из цифр, латинских букв, символов - и _.\n'
    }
    if (!/^[A-Za-z0-9_-]{3,16}$/.test(user.password)) {
      err +=
        'Длина пароля должна быть от 3 до 16 знаков и должен состоять из цифр, прописных и строчных букв, символов - и _.\n'
    }
    if (user.password !== user.passwordRepeat) {
      err += 'Пароли не совпадают.\n'
    }
    return err
  }

  // Валидация пароля
  validatePassword(user: UserPassword) {
    let err = ''
    if (!/^[A-Za-z0-9_-]{3,16}$/.test(user.password)) {
      err +=
        'Длина пароля должна быть от 3 до 16 знаков и должен состоять из цифр, прописных и строчных букв, символов - и _.\n'
    }
    if (user.password !== user.passwordRepeat) {
      err += 'Пароли не совпадают.\n'
    }
    return err
  }

  // Валидация основной информации
  validateGeneral(user: User) {
    let err = ''
    user.nickname = this.trim(user.nickname)
    if (user.nickname === '') {
      err += 'Никнейм не может быть пустым.\n'
    }
    if (user.nickname.length > 32) {
      err += 'Никнейм не должен превышать 32 символов.\n'
    }
    return err
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
        err +=
          'Не поддерживаемый тип изображения. Поддерживаемые форматы: jpeg, png, webp.\n'
    }
    if (file.size > 5 * 1024 * 1024) {
      err += 'Слишком большой размер изображения'
    }
    return err
  }

  // Валидация тикета
  validateTicket = (ticket: Ticket) => {
    let err = ''
    ticket.text = this.trim(ticket.text)
    if (ticket.title.length < 3 || ticket.title.length > 100) {
      err += 'Длина названия заявки в должна быть от 3 до 100 символов.\n'
    }
    if (ticket.text.length < 3 || ticket.text.length > 150) {
      err += 'Длина текста заявки должна быть от 3 до 150 символов.\n'
    }
    return err
  }

  // Валидация статуса тикета
  validateTicketStatus = (status: number) => {
    let err = ''
    if (status !== 0 && status !== 1 && status !== 9) {
      err += 'Ошибка валидации статуса'
    }
    return err
  }

  // Валидация персонажа
  validateCharacter = (character: Character | any) => {
    let err = ''
    this.trimObject(character, [
      'title',
      'nickname',
      'race',
      'nation',
      'territory',
      'className',
      'occupation',
      'religion',
      'languages',
    ])
    this.normalize(character, ['friends', 'coauthors'])

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
      err +=
        'Длина названия класса персонажа не должна первышать 35 символов.\n'
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
      err += 'Ошибка с полом.\n'
    }
    if (character.status < 0 || character.status > 3) {
      err += 'Ошибка со статусом.\n'
    }
    if (character.active < 0 || character.active > 3) {
      err += 'Ошибка с активностью.\n'
    }
    if (character.closed < 0 || character.closed > 1) {
      err += 'Ошибка closed.\n'
    }
    if (character.hidden < 0 || character.hidden > 1) {
      err += 'Ошибка hidden.\n'
    }
    if (character.comment < 0 || character.comment > 1) {
      err += 'Ошибка comment.\n'
    }

    return err
  }

  validateGuild = (g: Guild) => {
    let err = ''
    this.trimObject(g, ['title', 'gameTitle', 'ideology', 'shortDescription'])
    this.normalize(g, ['members', 'coauthors'])

    if (g.title.length < 3 || g.title.length > 35) {
      err += 'Длина имени гильдии должна быть от 3 до 35 символов.\n'
    }
    if (g.gameTitle.length < 3 || g.gameTitle.length > 35) {
      err += 'Длина игрового имени гильдии должна быть от 3 до 35 символов.\n'
    }
    if (g.description.length < 1) {
      err += 'Описание обязательно для заполнения.\n'
    }
    if (g.rule.length < 1) {
      err += 'Правила обязательны для заполнения.\n'
    }
    if (g.status < 0 || g.status > 2) {
      err += 'Ошибка со статусом.\n'
    }
    if (g.kit < 0 || g.kit > 2) {
      err += 'Ошибка с набором.\n'
    }
    if (g.closed < 0 || g.closed > 1) {
      err += 'Ошибка closed.\n'
    }
    if (g.hidden < 0 || g.hidden > 1) {
      err += 'Ошибка hidden.\n'
    }
    if (g.comment < 0 || g.comment > 1) {
      err += 'Ошибка comment.\n'
    }
    return err
  }

  validateStory(g: Story) {
    let err = ''
    this.trimObject(g, ['title', 'period', 'shortDescription'])
    this.normalize(g, ['members', 'guilds', 'coauthors'])
    if (!g.dateStart) {
      g.dateStart = new Date().toISOString().substr(0, 10)
    }
    if (g.title.length < 3 || g.title.length > 35) {
      err += 'Длина имени сюжета должна быть от 3 до 35 символов.\n'
    }
    if (g.description.length < 1) {
      err += 'Описание обязательно для заполнения.\n'
    }
    if (g.rule.length < 1) {
      err += 'Условия и правила обязательны для заполнения.\n'
    }
    if (g.status < 0 || g.status > 3) {
      err += 'Ошибка со статусом.\n'
    }
    if (g.closed < 0 || g.closed > 1) {
      err += 'Ошибка closed.\n'
    }
    if (g.hidden < 0 || g.hidden > 1) {
      err += 'Ошибка hidden.\n'
    }
    if (g.comment < 0 || g.comment > 1) {
      err += 'Ошибка comment.\n'
    }
    return err
  }

  // Валидация отчета / лога
  validateReport(report: Report) {
    let err = ''
    this.trimObject(report, [
      'title',
      'shortDescription',
      'description',
      'rule',
    ])
    this.normalize(report, ['members', 'guilds', 'stores', 'coauthors'])
    if (report.title.length < 3 || report.title.length > 35) {
      err += 'Длина имени отчета / лога должна быть от 3 до 35 символов.\n'
    }
    if (report.description.length < 1) {
      err += 'Описание обязательно для заполнения.\n'
    }
    if (report.shortDescription.length < 1) {
      err += 'Анонс обязателен для заполнения.\n'
    }
    if (report.rule.length < 1) {
      err += 'Условия и правила обязательны для заполнения.\n'
    }
    if (report.closed < 0 || report.closed > 1) {
      err += 'Ошибка closed.\n'
    }
    if (report.hidden < 0 || report.hidden > 1) {
      err += 'Ошибка hidden.\n'
    }
    if (report.comment < 0 || report.comment > 1) {
      err += 'Ошибка comment.\n'
    }
    return err
  }

  // Валидация форума
  validateForum(forum: Forum) {
    let err = ''
    this.trimObject(forum, ['title', 'shortDescription', 'description', 'rule'])
    this.normalize(forum, ['coauthors'])
    if (forum.title.length < 3 || forum.title.length > 35) {
      err += 'Длина имени форума должна быть от 3 до 35 символов.\n'
    }
    if (forum.description.length < 1) {
      err += 'Описание обязательно для заполнения.\n'
    }
    if (forum.closed < 0 || forum.closed > 1) {
      err += 'Ошибка closed.\n'
    }
    if (forum.hidden < 0 || forum.hidden > 1) {
      err += 'Ошибка hidden.\n'
    }
    if (forum.comment < 0 || forum.comment > 1) {
      err += 'Ошибка comment.\n'
    }
    return err
  }

  // Валидация новости
  validateArticle(article: Article) {
    let err = ''
    this.trimObject(article, ['title', 'shortDescription', 'description'])
    // this.normalize(article, ['coauthors'])
    if (article.title.length < 3 || article.title.length > 35) {
      err += 'Длина имени новости должна быть от 3 до 35 символов.\n'
    }
    if (article.description.length < 1) {
      err += 'Описание обязательно для заполнения.\n'
    }
    if (article.closed < 0 || article.closed > 1) {
      err += 'Ошибка closed.\n'
    }
    if (article.hidden < 0 || article.hidden > 1) {
      err += 'Ошибка hidden.\n'
    }
    if (article.comment < 0 || article.comment > 1) {
      err += 'Ошибка comment.\n'
    }
    return err
  }
}

export default Validator
