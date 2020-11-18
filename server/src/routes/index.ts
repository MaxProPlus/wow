import {Express, Router} from 'express'
import UserController from '../controllers/userController'
import TicketController from '../controllers/ticketController'
import CharacterController from '../controllers/characterController'
import GuildController from '../controllers/guildController'
import StoryController from '../controllers/storyController'
import ReportController from '../controllers/reportController'
import ForumController from '../controllers/forumController'
import FeedbackController from '../controllers/feedbackController'
import ArticleController from '../controllers/articleController'
import MaterialController from '../controllers/materialController'

// Инициализация роутов
export default (app: Express) => {
    const router = Router()

    // Инициализация контроллеров
    const userController = new UserController(app)
    const articleController = new ArticleController(app)
    const ticketController = new TicketController(app)
    const characterController = new CharacterController(app)
    const guildController = new GuildController(app)
    const storyController = new StoryController(app)
    const reportController = new ReportController(app)
    const forumController = new ForumController(app)
    const feedbackController = new FeedbackController(app)
    const materialController = new MaterialController(app)

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

    // Новости
    router.post('/articles', articleController.create)
    router.get('/articles', articleController.getAll)
    router.get('/articles/:id', articleController.getById)
    router.put('/articles/:id', articleController.update)
    router.delete('/articles/:id', articleController.remove)
    router.post('/articles/comments', articleController.createComment)
    router.get('/articles/:id/comments', articleController.getComments)
    router.delete('/articles/:idArticle/comments/:idComment', articleController.removeComment)

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
    router.get('/characters/:id/comments', characterController.getComments)
    router.delete('/characters/:idCharacter/comments/:idComment', characterController.removeComment)

    // Гильдии
    router.post('/guilds', guildController.create)
    router.get('/guilds', guildController.getAll)
    router.get('/guilds/:id', guildController.getById)
    router.put('/guilds/:id', guildController.update)
    router.delete('/guilds/:id', guildController.remove)
    router.post('/guilds/comments', guildController.createComment)
    router.get('/guilds/:id/comments', guildController.getComments)
    router.delete('/guilds/:idGuild/comments/:idComment', guildController.removeComment)

    // Сюжеты
    router.post('/stories', storyController.create)
    router.get('/stories', storyController.getAll)
    router.get('/stories/:id', storyController.getById)
    router.put('/stories/:id', storyController.update)
    router.delete('/stories/:id', storyController.remove)
    router.post('/stories/comments', storyController.createComment)
    router.get('/stories/:id/comments', storyController.getComments)
    router.delete('/stories/:idStory/comments/:idComment', storyController.removeComment)

    // Отчеты
    router.post('/reports', reportController.create)
    router.get('/reports', reportController.getAll)
    router.get('/reports/:id', reportController.getById)
    router.put('/reports/:id', reportController.update)
    router.delete('/reports/:id', reportController.remove)
    router.post('/reports/comments', reportController.createComment)
    router.get('/reports/:id/comments', reportController.getComments)
    router.delete('/reports/:idReport/comments/:idComment', reportController.removeComment)

    // форумы
    router.post('/forums', forumController.create)
    router.get('/forums', forumController.getAll)
    router.get('/forums/:id', forumController.getById)
    router.put('/forums/:id', forumController.update)
    router.delete('/forums/:id', forumController.remove)
    router.post('/forums/comments', forumController.createComment)
    router.get('/forums/:id/comments', forumController.getComments)
    router.delete('/forums/:idForum/comments/:idComment', forumController.removeComment)

    // Выборка по всем мартериалам
    router.get('/materials', materialController.getAll)

    // Обратная связь
    router.get('/feedback', feedbackController.getAll)
    router.post('/feedback', feedbackController.update)

    return router
}
