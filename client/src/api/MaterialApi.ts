import Api from './BasicApi'

class MaterialApi extends Api {
  // Получить все материалы по запросу
  getAll(limit: number, page: number, data: any) {
    let url = `/api/materials?limit=${limit}&page=${page}`
    if (!!data) {
      for (let key in data) {
        url += `&${key}=${data[key]}`
      }
    }
    return this.get(url).then((r) => {
      if (r.status !== 'OK') return Promise.reject(r.errorMessage)
      return r.results
    })
  }
}

export default MaterialApi
