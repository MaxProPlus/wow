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
import Auth from '../services/auth'
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

// Инициализация провайдеров
const db = connection()
const smtp = initSmtp()
const rightProvider = new RightProvider(db)
const validator = new Validator()
const uploader = new Uploader()
const hash = new Hash()

const userRepository = new UserRepository(db.getPoolPromise())
const userProvider = new UserProvider(userRepository, smtp, rightProvider, uploader, hash)
export const auth = new Auth(userRepository, userProvider, hash)
export const userController = new UserController(rightProvider, auth, userProvider, smtp, validator)

const articleRepository = new ArticleRepository(db.getPoolPromise())
const articleProvider = new ArticleProvider(articleRepository, rightProvider, uploader)
export const articleController = new ArticleController(rightProvider, auth, articleProvider, validator)

const ticketRepository = new TicketRepository(db.getPoolPromise())
const ticketProvider = new TicketProvider(ticketRepository, rightProvider)
export const ticketController = new TicketController(rightProvider, auth, ticketProvider, validator)

const characterRepository = new CharacterRepository(db.getPoolPromise())
const characterProvider = new CharacterProvider(characterRepository, rightProvider, uploader)
export const characterController = new CharacterController(rightProvider, auth, characterProvider, validator)

const guildRepository = new GuildRepository(db.getPoolPromise())
const guildProvider = new GuildProvider(guildRepository, rightProvider, uploader)
export const guildController = new GuildController(rightProvider, auth, guildProvider, validator)

const storyRepository = new StoryRepository(db.getPoolPromise())
const storyProvider = new StoryProvider(storyRepository, rightProvider, uploader)
export const storyController = new StoryController(rightProvider, auth, storyProvider, validator)

const reportRepository = new ReportRepository(db.getPoolPromise())
const reportProvider = new ReportProvider(reportRepository, rightProvider, uploader)
export const reportController = new ReportController(rightProvider, auth, reportProvider, validator)

const forumRepository = new ForumRepository(db.getPoolPromise())
const forumProvider = new ForumProvider(forumRepository, rightProvider, uploader)
export const forumController = new ForumController(rightProvider, auth, forumProvider, validator)

const feedbackRepository = new FeedbackRepository(db.getPoolPromise())
const feedbackProvider = new FeedbackProvider(feedbackRepository)
export const feedbackController = new FeedbackController(rightProvider, auth, feedbackProvider)

const materialRepository = new MaterialRepository(db.getPoolPromise())
const materialProvider = new MaterialProvider(materialRepository)
export const materialController = new MaterialController(materialProvider)