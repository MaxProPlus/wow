import {Express, Router} from 'express'
import UserController from '../controllers/UserController'
import TicketController from '../controllers/TicketController'
import CharacterController from '../controllers/CharacterController'
import GuildController from '../controllers/GuildController'
import StoryController from '../controllers/StoryController'
import ReportController from '../controllers/ReportController'
import ForumController from '../controllers/ForumController'

// Инициализация роутов
export default (app: Express) => {
    const router = Router()

    // Инициализация контроллеров
    const userController = new UserController(app)
    const ticketController = new TicketController(app)
    const characterController = new CharacterController(app)
    const guildController = new GuildController(app)
    const storyController = new StoryController(app)
    const reportController = new ReportController(app)
    const forumController = new ForumController(app)

    router.post('/users/general', userController.updateGeneral)
    router.post('/users/avatar', userController.updateAvatar)
    router.post('/users/secure', userController.updateSecure)
    router.post('/users/password', userController.updatePassword)
    router.post('/users/signup', userController.signUp)
    router.get('/users/accept/reg', userController.acceptReg)
    router.get('/users/accept/email', userController.acceptEmail)
    router.post('/users/signin', userController.signIn)
    router.get('/users/logout', userController.logout)
    router.get('/users/context', userController.getContext)
    router.get('/users/general', userController.getGeneral)
    router.get('/users/:id', userController.getUser)
    router.get('/users', userController.getAll)

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

    return router
}
