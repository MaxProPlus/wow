// Форматирование дат
class DateFormatter {
    static format = (date: string | Date) => {
        return (new Date(date)).toLocaleString('ru-RU', {year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'})
    }

    static withoutYear = (date: string | Date) => {
        return (new Date(date)).toLocaleString('ru-RU', {month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'})
    }

    static onlyDate = (date: string | Date) => {
        return (new Date(date)).toLocaleDateString('ru-RU', {year: 'numeric', month: 'long', day: 'numeric',})
    }
}

export default DateFormatter