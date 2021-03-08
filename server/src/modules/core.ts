import ConfigProvider from '../services/config'
import initLogger from '../services/logger'
import DB from '../services/mysql'
import Smtp from '../services/smtp'
import Uploader from '../services/uploader'
import Hash from '../services/hash'
import {PoolOptions} from 'mysql2'

// Инициализация системных провайдеров
export const configProvider = new ConfigProvider()
export const db = new DB(configProvider.get<PoolOptions>('db'))
export const smtp = new Smtp(configProvider)
export const hash = new Hash()
export const logger = initLogger()
export const uploader = new Uploader(hash, logger)
