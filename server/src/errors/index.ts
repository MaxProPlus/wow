// Ошибка приложения
export class ApiError extends Error {
    constructor(message: string, name: string = 'ERROR') {
        super(message)
        super.name = name
    }
}

// Ошибка базы данных
export class DBError extends ApiError {
    constructor(message: string = 'Ошибка запроса к бд', name: string = 'ERROR_DB') {
        super(message, name)
    }
}

// Ошибка авторизации
export class UnauthorizedError extends ApiError {
    constructor(message: string = 'Ошибка аутентификации', name: string = 'UNAUTHORIZED') {
        super(message, name)
    }
}

// Ошибка прав
export class ForbiddenError extends ApiError {
    constructor(message: string = 'Нет прав', name: string = 'FORBIDDEN') {
        super(message, name)
    }
}

// Ошибка "не найдено"
export class NotFoundError extends ApiError {
    constructor(message: string, name: string = 'NOT_FOUND') {
        super(message, name)
    }
}

// Ошибка парсинга параметров
export class ParseError extends ApiError {
    constructor(message: string = 'Ошибка парсинга параметров', name: string = 'ERROR_PARSE') {
        super(message, name)
    }
}

// Ошибка валидации
export class ValidationError extends ApiError {
    constructor(message: string, name: string = 'ERROR_VALIDATION') {
        super(message, name)
    }
}

// Ошибка "Файл не прикреплен"
export class FileError extends ApiError {
    constructor(message: string = 'Файл не прикреплен', name: string = 'ERROR_FILE') {
        super(message, name)
    }
}
