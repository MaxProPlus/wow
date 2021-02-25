import {configProvider, db, hash, smtp, uploader} from './core'
import UserController from '../controllers/user'
import ArticleController from '../controllers/article'
import TicketController from '../controllers/ticket'
import CharacterController from '../controllers/character'
import GuildController from '../controllers/guild'
import StoryController from '../controllers/story'
import ReportController from '../controllers/report'
import ForumController from '../controllers/forum'
import FeedbackController from '../controllers/feedback'
import MaterialController from '../controllers/material'
import RightProvider from '../providers/right'
import Validator from '../common/validator'
import UserProvider from '../providers/account'
import UserRepository from '../repositories/user'
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
import RightRepository from '../repositories/right'

// Общие провайдеры
const validator = new Validator()

// Провайдер на проверку прав
const rightRepository = new RightRepository(db.getPoolPromise())
const rightProvider = new RightProvider(rightRepository)

// Провайдер, репозиторий на регистрацию
const registrationRepository = new RegistrationRepository(db.getPoolPromise())
const registrationProvider = new RegistrationProvider(
  registrationRepository,
  configProvider,
  hash,
  smtp
)

// Провайдер, репозиторий на аутентификацию
const authRepository = new AuthRepository(db.getPoolPromise())
export const authProvider = new AuthProvider(
  authRepository,
  registrationRepository,
  hash
)

// Контроллеры на регистрацию, аутентифицацию
export const registrationController = new RegistrationController(
  registrationProvider,
  authProvider,
  validator
)
export const authController = new AuthController(authProvider)

// Модуль пользователей
const userRepository = new UserRepository(db.getPoolPromise())
const userProvider = new UserProvider(
  userRepository,
  smtp,
  rightProvider,
  uploader
)
export const userController = new UserController(userProvider, smtp, validator)

// Модуль новостей
const articleRepository = new ArticleRepository(db.getPoolPromise())
const articleProvider = new ArticleProvider(articleRepository, uploader)
export const articleController = new ArticleController(
  authProvider,
  articleProvider,
  validator
)

// Модуль тикетов
const ticketRepository = new TicketRepository(db.getPoolPromise())
const ticketProvider = new TicketProvider(ticketRepository)
export const ticketController = new TicketController(ticketProvider, validator)

// Модуль персонажей
const characterRepository = new CharacterRepository(db.getPoolPromise())
const characterProvider = new CharacterProvider(characterRepository, uploader)
export const characterController = new CharacterController(
  authProvider,
  characterProvider,
  validator
)

// Модуль гильдий
const guildRepository = new GuildRepository(db.getPoolPromise())
const guildProvider = new GuildProvider(guildRepository, uploader)
export const guildController = new GuildController(
  authProvider,
  guildProvider,
  validator
)

// Модуль сюжетов
const storyRepository = new StoryRepository(db.getPoolPromise())
const storyProvider = new StoryProvider(storyRepository, uploader)
export const storyController = new StoryController(
  authProvider,
  storyProvider,
  validator
)

// Модуль отчетов
const reportRepository = new ReportRepository(db.getPoolPromise())
const reportProvider = new ReportProvider(reportRepository, uploader)
export const reportController = new ReportController(
  authProvider,
  reportProvider,
  validator
)

// Модуль форумов
const forumRepository = new ForumRepository(db.getPoolPromise())
const forumProvider = new ForumProvider(forumRepository, uploader)
export const forumController = new ForumController(
  authProvider,
  forumProvider,
  validator
)

// Модуль обратной связи
const feedbackRepository = new FeedbackRepository(db.getPoolPromise())
const feedbackProvider = new FeedbackProvider(feedbackRepository)
export const feedbackController = new FeedbackController(feedbackProvider)

// Модуль материалов
const materialRepository = new MaterialRepository(db.getPoolPromise())
const materialProvider = new MaterialProvider(materialRepository)
export const materialController = new MaterialController(materialProvider)
