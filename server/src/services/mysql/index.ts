import mysql2, {Pool, PoolOptions} from 'mysql2'

// Обертка для работы с бд
export class DB {
  private pool: Pool
  constructor(db: PoolOptions) {
    this.pool = mysql2.createPool(db)
  }

  // Получить пул соединений обернутый промисом mysql2
  getPoolPromise = () => {
    return this.pool.promise()
  }
}

export default DB
