import Mapper from '../mappers/material'

class Material {
    private mapper: Mapper

    constructor(connection: any) {
        this.mapper = new Mapper(connection.getPoolPromise())
    }

    // Получить все материалы
    getAll = (limit: number, page: number, data?: any) => {
        const p = []
        p.push(this.mapper.selectAll(limit, page, data))
        p.push(this.mapper.selectCount(data))
        return Promise.all(p).then((r)=>{
            return {
                data: r[0],
                count: r[1],
            }
        })
    }
}

export default Material