// @ts-ignore
import mysql from 'mysql2'

// Конфиг подключения бд
const db = {
    connectionLimit: process.env.DB_CONNECTION_LIMIT,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
}

// Обертка для работы с бд
export class DB {
    private pool = mysql.createPool(db)

    // Получить промис пул соединений
    getPoolPromise = () => {
        return this.pool.promise()
    }
}

export default ()=>new DB()
