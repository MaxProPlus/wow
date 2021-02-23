// @ts-ignore
import mysql2 from 'mysql2'
import {Pool, PoolConfig} from 'mysql'

// Обертка для работы с бд
export class DB {
  private pool: Pool
  constructor(db: PoolConfig) {
    this.pool = mysql2.createPool(db)
  }

  // Получить пул соединений обернутый промисом mysql2
  getPoolPromise = () => {
    // @ts-ignore
    return this.pool.promise()
  }
}

export default DB
