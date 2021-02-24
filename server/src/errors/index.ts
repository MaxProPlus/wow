// Ошибка приложения
export class ApiError extends Error {
  constructor(message: string, name = 'ERROR') {
    super(message)
    super.name = name
  }
}

// Ошибка базы данных
export class DBError extends ApiError {
  constructor(message = 'Ошибка запроса к бд', name = 'ERROR_DB') {
    super(message, name)
  }
}

// Ошибка авторизации
export class UnauthorizedError extends ApiError {
  constructor(message = 'Ошибка аутентификации', name = 'UNAUTHORIZED') {
    super(message, name)
  }
}

// Ошибка прав
export class ForbiddenError extends ApiError {
  constructor(message = 'Нет прав', name = 'FORBIDDEN') {
    super(message, name)
  }
}

// Ошибка "не найдено"
export class NotFoundError extends ApiError {
  constructor(message: string, name = 'NOT_FOUND') {
    super(message, name)
  }
}

// Ошибка парсинга параметров
export class ParseError extends ApiError {
  constructor(message = 'Ошибка парсинга параметров', name = 'ERROR_PARSE') {
    super(message, name)
  }
}

// Ошибка валидации
export class ValidationError extends ApiError {
  constructor(message: string, name = 'ERROR_VALIDATION') {
    super(message, name)
  }
}

// Ошибка "Файл не прикреплен"
export class FileError extends ApiError {
  constructor(message = 'Файл не прикреплен', name = 'ERROR_FILE') {
    super(message, name)
  }
}
