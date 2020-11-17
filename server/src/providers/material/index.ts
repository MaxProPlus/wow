import MaterialRepository from '../../repositories/material'

class MaterialProvider {
    private repository: MaterialRepository

    constructor(connection: any) {
        this.repository = new MaterialRepository(connection.getPoolPromise())
    }

    // Получить все материалы
    getAll = (limit: number, page: number, data?: any) => {
        const p = []
        p.push(this.repository.selectAll(limit, page, data))
        p.push(this.repository.selectCount(data))
        return Promise.all(p).then((r) => {
            return {
                data: r[0],
                count: r[1],
            }
        })
    }
}

export default MaterialProvider