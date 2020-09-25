import {Router} from 'express'
import AccountController from '../controllers/AccountController'
import TicketController from '../controllers/TicketController'
import CharacterController from '../controllers/CharacterController'
import GuildController from '../controllers/GuildController'
import StoryController from '../controllers/StoryController'
import ReportController from '../controllers/ReportController'
import ForumController from '../controllers/ForumController'

const router = Router()

const accountController = new AccountController()
const ticketController = new TicketController()
const characterController = new CharacterController()
const guildController = new GuildController()
const storyController = new StoryController()
const reportController = new ReportController()
const forumController = new ForumController()

router.post('/users/general', accountController.updateGeneral)
router.post('/users/avatar', accountController.updateAvatar)
router.post('/users/secure', accountController.updateSecure)
router.post('/users/password', accountController.updatePassword)
router.post('/users/signup', accountController.signUp)
router.post('/users/signin', accountController.signIn)
router.get('/users/logout', accountController.logout)
router.get('/users/context', accountController.getContext)
router.get('/users/general', accountController.getGeneral)
router.get('/users/:id', accountController.getUser)
router.get('/users', accountController.getAll)

// Тикеты
router.post('/tickets', ticketController.create)
router.post('/tickets/comments', ticketController.createComment)
router.get('/ticket_types', ticketController.getTypesOfTicket)
router.get('/tickets/types/:id', ticketController.getTicketsByType)
router.get('/tickets/:id', ticketController.getById)
router.post('/tickets/:id', ticketController.changeStatus)
router.get('/tickets/:idTicket/comments', ticketController.getComments)

// Персонажи
router.post('/characters', characterController.create)
router.get('/characters', characterController.getAll)
router.get('/characters/:id', characterController.getById)
router.put('/characters/:id', characterController.update)
router.delete('/characters/:id', characterController.remove)
router.post('/characters/comments', characterController.createComment)
router.get('/characters/:idCharacter/comments', characterController.getComments)
// router.delete('/characters/:idCharacter/comments/:idComment', characterController.removeComment)

// Гильдии
router.post('/guilds', guildController.create)
router.get('/guilds', guildController.getAll)
router.get('/guilds/:id', guildController.getById)
router.put('/guilds/:id', guildController.update)
router.delete('/guilds/:id', guildController.remove)
router.post('/guilds/comments', guildController.createComment)
router.get('/guilds/:idCharacter/comments', guildController.getComments)
// router.delete('/guilds/:idCharacter/comments/:idComment', guildController.removeComment)

// Сюжеты
router.post('/stories', storyController.create)
router.get('/stories', storyController.getAll)
router.get('/stories/:id', storyController.getById)
router.put('/stories/:id', storyController.update)
router.delete('/stories/:id', storyController.remove)
router.post('/stories/comments', storyController.createComment)
router.get('/stories/:id/comments', storyController.getComments)
// router.delete('/stories/:idCharacter/comments/:idComment', storyController.removeComment)

// Отчеты
router.post('/reports', reportController.create)
router.get('/reports', reportController.getAll)
router.get('/reports/:id', reportController.getById)
router.put('/reports/:id', reportController.update)
router.delete('/reports/:id', reportController.remove)
router.post('/reports/comments', reportController.createComment)
router.get('/reports/:id/comments', reportController.getComments)
// router.delete('/reports/:idCharacter/comments/:idComment', reportController.removeComment)

// форумы
router.post('/forums', forumController.create)
router.get('/forums', forumController.getAll)
router.get('/forums/:id', forumController.getById)
router.put('/forums/:id', forumController.update)
router.delete('/forums/:id', forumController.remove)
router.post('/forums/comments', forumController.createComment)
router.get('/forums/:id/comments', forumController.getComments)
// router.delete('/forums/:idCharacter/comments/:idComment', forumController.removeComment)

export default router
