import connection from '../services/mysql'
import initSmtp from '../services/smtp'
import UserController from '../controllers/userController'
import ArticleController from '../controllers/articleController'
import TicketController from '../controllers/ticketController'
import CharacterController from '../controllers/characterController'
import GuildController from '../controllers/guildController'
import StoryController from '../controllers/storyController'
import ReportController from '../controllers/reportController'
import ForumController from '../controllers/forumController'
import FeedbackController from '../controllers/feedbackController'
import MaterialController from '../controllers/materialController'
import RightProvider from '../providers/right'
import Validator from '../common/validator'
import UserProvider from '../providers/account'
import UserRepository from '../repositories/user'
import Uploader from '../services/uploader'
import Hash from '../services/hash'
import ArticleRepository from '../repositories/article'
import ArticleProvider from '../providers/article'
import TicketRepository from '../repositories/ticket'
import TicketProvider from '../providers/ticket'
import CharacterRepository from '../repositories/character'
import CharacterProvider from '../providers/character'
import GuildRepository from '../repositories/guild'
import GuildProvider from '../providers/guild'
import StoryRepository from '../repositories/story'
import StoryProvider from '../providers/story'
import ReportRepository from '../repositories/report'
import ReportProvider from '../providers/report'
import ForumRepository from '../repositories/forum'
import ForumProvider from '../providers/forum'
import FeedbackRepository from '../repositories/feedback'
import FeedbackProvider from '../providers/feedback'
import MaterialRepository from '../repositories/material'
import MaterialProvider from '../providers/material'
import AuthRepository from '../repositories/auth'
import AuthProvider from '../providers/auth'
import AuthController from '../controllers/auth'
import RegistrationRepository from '../repositories/registration'
import RegistrationProvider from '../providers/registration'
import RegistrationController from '../controllers/registration'

// Общие провайдеры
const db = connection()
const smtp = initSmtp()
const validator = new Validator()
const uploader = new Uploader()
const hash = new Hash()

// Провайдер на проверку прав
const rightProvider = new RightProvider(db)

// Провайдер, репозиторий на регистрацию
const registrationRepository = new RegistrationRepository(db.getPoolPromise())
const registrationProvider = new RegistrationProvider(registrationRepository, hash, smtp)

// Провайдер, репозиторий на аутентификацию
const authRepository = new AuthRepository(db.getPoolPromise())
export const authProvider = new AuthProvider(authRepository, registrationRepository, hash)

// Контроллеры на регистрацию, аутентифицацию
export const registrationController = new RegistrationController(registrationProvider, authProvider, validator)
export const authController = new AuthController(authProvider)

// Модуль пользователей
const userRepository = new UserRepository(db.getPoolPromise())
const userProvider = new UserProvider(userRepository, smtp, rightProvider, uploader)
export const userController = new UserController(rightProvider, authProvider, userProvider, smtp, validator)

// Модуль новостей
const articleRepository = new ArticleRepository(db.getPoolPromise())
const articleProvider = new ArticleProvider(articleRepository, rightProvider, uploader)
export const articleController = new ArticleController(rightProvider, authProvider, articleProvider, validator)

// Модуль тикетов
const ticketRepository = new TicketRepository(db.getPoolPromise())
const ticketProvider = new TicketProvider(ticketRepository, rightProvider)
export const ticketController = new TicketController(rightProvider, authProvider, ticketProvider, validator)

// Модуль персонажей
const characterRepository = new CharacterRepository(db.getPoolPromise())
const characterProvider = new CharacterProvider(characterRepository, rightProvider, uploader)
export const characterController = new CharacterController(rightProvider, authProvider, characterProvider, validator)

// Модуль гильдий
const guildRepository = new GuildRepository(db.getPoolPromise())
const guildProvider = new GuildProvider(guildRepository, rightProvider, uploader)
export const guildController = new GuildController(rightProvider, authProvider, guildProvider, validator)

// Модуль сюжетов
const storyRepository = new StoryRepository(db.getPoolPromise())
const storyProvider = new StoryProvider(storyRepository, rightProvider, uploader)
export const storyController = new StoryController(rightProvider, authProvider, storyProvider, validator)

// Модуль отчетов
const reportRepository = new ReportRepository(db.getPoolPromise())
const reportProvider = new ReportProvider(reportRepository, rightProvider, uploader)
export const reportController = new ReportController(rightProvider, authProvider, reportProvider, validator)

// Модуль форумов
const forumRepository = new ForumRepository(db.getPoolPromise())
const forumProvider = new ForumProvider(forumRepository, rightProvider, uploader)
export const forumController = new ForumController(rightProvider, authProvider, forumProvider, validator)

// Модуль обратной связи
const feedbackRepository = new FeedbackRepository(db.getPoolPromise())
const feedbackProvider = new FeedbackProvider(feedbackRepository)
export const feedbackController = new FeedbackController(rightProvider, authProvider, feedbackProvider)

// Модуль материалов
const materialRepository = new MaterialRepository(db.getPoolPromise())
const materialProvider = new MaterialProvider(materialRepository)
export const materialController = new MaterialController(materialProvider)
