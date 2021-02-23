class Repository {
    constructor(protected pool: any) {
    }

    // Генерировать where связкой and, если есть data
    // Включая похожие строки
    protected genWhereAnd = (data: any) => {
        const where = []
        let sqlWhere = ''
        if (data && Object.keys(data).length) {
            sqlWhere += ' where'
            let i = 0
            // tslint:disable-next-line:forin
            for (const key in data) {
                if (i++ !== 0) {
                    sqlWhere += ` and`
                }
                if (typeof data[key] === 'string') {
                    sqlWhere += ` ${key} like ?`
                    // Включая похожие строки
                    where.push(`%${data[key]}%`)
                } else {
                    sqlWhere += ` ${key} = ?`
                    where.push(data[key])
                }
            }
        }
        return {where, sqlWhere}
    }

    // Генерировать where связкой or, если есть data
    // Точное совпадение
    protected genWhereOr = (data: any) => {
        const where = []
        let sqlWhere = ''
        if (data && Object.keys(data).length) {
            sqlWhere += ' where'
            let i = 0
            // tslint:disable-next-line:forin
            for (const key in data) {
                if (i++ !== 0) {
                    sqlWhere += ` or`
                }
                sqlWhere += ` ${key} = ?`
                where.push(data[key])
            }
        }
        return {where, sqlWhere}
    }

    // Генерировать дополнительные условия для data
    // Включая похожие строки
    protected genConditionAnd = (data: any) => {
        const where = []
        let sqlWhere = ''
        if (data) {
            // tslint:disable-next-line:forin
            for (const key in data) {
                if (typeof data[key] === 'string') {
                    sqlWhere += ` and ${key} like ?`
                    // Включая похожие строки
                    where.push(`%${data[key]}%`)
                } else {
                    sqlWhere += ` and ${key} = ?`
                    where.push(data[key])
                }
            }
        }
        return {where, sqlWhere}
    }
}

export default Repository