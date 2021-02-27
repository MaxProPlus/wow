// Типы ошибок
export enum Errors {
  ERROR = 'ERROR',
  ERROR_DB = 'ERROR_DB',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  ERROR_PARSE = 'ERROR_PARSE',
  ERROR_VALIDATION = 'ERROR_VALIDATION',
  ERROR_FILE = 'ERROR_FILE',
  ERROR_SMTP = 'ERROR_SMTP',
  ERROR_AUTH = 'ERROR_AUTH',
  ERROR_REGISTRATION = 'ERROR_REGISTRATION',
  ERROR_TICKET = 'ERROR_TICKET',
}

// Ошибка приложения
export class ApiError extends Error {
  constructor(message: string, name = Errors.ERROR) {
    super(message)
    super.name = name
  }
}

// Ошибка базы данных
export class DBError extends ApiError {
  constructor(message = 'Ошибка запроса к бд', name = Errors.ERROR_DB) {
    super(message, name)
  }
}

// Ошибка авторизации
export class UnauthorizedError extends ApiError {
  constructor(message = 'Ошибка аутентификации', name = Errors.UNAUTHORIZED) {
    super(message, name)
  }
}

// Ошибка прав
export class ForbiddenError extends ApiError {
  constructor(message = 'Нет прав', name = Errors.FORBIDDEN) {
    super(message, name)
  }
}

// Ошибка "не найдено"
export class NotFoundError extends ApiError {
  constructor(message: string, name = Errors.NOT_FOUND) {
    super(message, name)
  }
}

// Ошибка парсинга параметров
export class ParseError extends ApiError {
  constructor(
    message = 'Ошибка парсинга параметров',
    name = Errors.ERROR_PARSE
  ) {
    super(message, name)
  }
}

// Ошибка валидации
export class ValidationError extends ApiError {
  constructor(message: string, name = Errors.ERROR_VALIDATION) {
    super(message, name)
  }
}

// Ошибка "Файл не прикреплен"
export class FileError extends ApiError {
  constructor(message = 'Файл не прикреплен', name = Errors.ERROR_FILE) {
    super(message, name)
  }
}
