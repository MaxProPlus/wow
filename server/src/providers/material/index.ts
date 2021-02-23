import MaterialRepository from '../../repositories/material'

class MaterialProvider {
    constructor(
        private repository: MaterialRepository
    ) {
    }

    // Получить все материалы
    getAll = (limit: number, page: number, data?: any): Promise<{data: any[], count: number}> => {
        const p = []
        p.push(this.repository.selectAll(limit, page, data))
        p.push(this.repository.selectCount(data))
        return Promise.all<any>(p).then((r) => {
            return {
                data: r[0],
                count: r[1],
            }
        })
    }
}

export default MaterialProvider