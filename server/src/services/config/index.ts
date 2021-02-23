const config = {
  env: process.env.NODE_ENV || 'development',
  port: +process.env.PORT! || 3001,
  host: process.env.HOST || 'localhost',
  db: {
    connectionLimit: +process.env.DB_CONNECTION_LIMIT! || 20,
    host: process.env.DB_HOST || 'localhost',
    port: +process.env.DB_PORT! || 3306,
    user: process.env.DB_USER || 'root',
    database: process.env.DB_DATABASE || 'wow',
    password: process.env.DB_PASSWORD || 'root',
  },
  sendEmail: !!+process.env.SEND_EMAIL!,
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: +process.env.SMTP_PORT! || 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASSWORD || '',
    }
  },
}

// Провайдер конфига
class ConfigProvider {
  // Получить параметр по ключу, пример: "db.host"
  get = <T>(key: string): T => {
    const arr = key.split('.')
    let r = config
    arr.forEach(item => {
      // @ts-ignore
      r = r[item]
    })
    return r as any as T
  }
}

export default ConfigProvider