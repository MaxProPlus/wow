import {Router} from 'express'
import {getUser, getUserWithRight} from '../middlewares/auth'
import {
  articleController,
  authController,
  characterController,
  feedbackController,
  forumController,
  guildController,
  materialController,
  registrationController,
  reportController,
  storyController,
  ticketController,
  userController,
} from '../modules/app'

// Инициализация роутов
export default () => {
  const router = Router()

  router.post('/users/signin', authController.login)
  router.get('/users/logout', authController.logout)

  router.post('/users/signup', registrationController.signUp)
  router.post('/users/secure', registrationController.updateSecure)
  router.post('/users/password', registrationController.updatePassword)
  router.get('/users/accept/reg', registrationController.acceptReg)
  router.get('/users/accept/email', registrationController.acceptEmail)

  router.post('/users/general', [getUser], userController.updateGeneral)
  router.post('/users/avatar', [getUser], userController.updateAvatar)
  router.get('/users/context', userController.getContext)
  router.get('/users/general', [getUser], userController.getGeneral)
  router.get('/users/:id', userController.getUser)
  router.get('/users', userController.getAll)

  // Новости
  router.post('/articles', [getUser], articleController.create)
  router.get('/articles', articleController.getAll)
  router.get('/articles/:id', articleController.getById)
  router.put('/articles/:id', [getUser], articleController.update)
  router.delete('/articles/:id', [getUser], articleController.remove)
  router.post('/articles/comments', [getUser], articleController.createComment)
  router.get('/articles/:id/comments', articleController.getComments)
  router.delete(
    '/articles/:idArticle/comments/:idComment',
    [getUser],
    articleController.removeComment
  )

  // Тикеты
  router.post('/tickets', [getUser], ticketController.create)
  router.post('/tickets/comments', [getUser], ticketController.createComment)
  router.get('/ticket_types', [getUser], ticketController.getTypesOfTicket)
  router.get('/tickets/types/:id', [getUser], ticketController.getTicketsByType)
  router.get('/tickets/:id', [getUser], ticketController.getById)
  router.post('/tickets/:id', [getUser], ticketController.changeStatus)
  router.get(
    '/tickets/:idTicket/comments',
    [getUser],
    ticketController.getComments
  )

  // Персонажи
  router.post('/characters', [getUser], characterController.create)
  router.get('/characters', characterController.getAll)
  router.get('/characters/:id', characterController.getById)
  router.put('/characters/:id', [getUserWithRight], characterController.update)
  router.delete('/characters/:id', [getUser], characterController.remove)
  router.post(
    '/characters/comments',
    [getUser],
    characterController.createComment
  )
  router.get('/characters/:id/comments', characterController.getComments)
  router.delete(
    '/characters/:idCharacter/comments/:idComment',
    [getUser],
    characterController.removeComment
  )

  // Гильдии
  router.post('/guilds', [getUser], guildController.create)
  router.get('/guilds', guildController.getAll)
  router.get('/guilds/:id', guildController.getById)
  router.put('/guilds/:id', [getUser], guildController.update)
  router.delete('/guilds/:id', [getUser], guildController.remove)
  router.post('/guilds/comments', [getUser], guildController.createComment)
  router.get('/guilds/:id/comments', guildController.getComments)
  router.delete(
    '/guilds/:idGuild/comments/:idComment',
    [getUser],
    guildController.removeComment
  )

  // Сюжеты
  router.post('/stories', [getUser], storyController.create)
  router.get('/stories', storyController.getAll)
  router.get('/stories/:id', storyController.getById)
  router.put('/stories/:id', [getUser], storyController.update)
  router.delete('/stories/:id', [getUser], storyController.remove)
  router.post('/stories/comments', [getUser], storyController.createComment)
  router.get('/stories/:id/comments', storyController.getComments)
  router.delete(
    '/stories/:idStory/comments/:idComment',
    [getUser],
    storyController.removeComment
  )

  // Отчеты
  router.post('/reports', [getUser], reportController.create)
  router.get('/reports', reportController.getAll)
  router.get('/reports/:id', reportController.getById)
  router.put('/reports/:id', [getUser], reportController.update)
  router.delete('/reports/:id', [getUser], reportController.remove)
  router.post('/reports/comments', [getUser], reportController.createComment)
  router.get('/reports/:id/comments', reportController.getComments)
  router.delete(
    '/reports/:idReport/comments/:idComment',
    [getUser],
    reportController.removeComment
  )

  // форумы
  router.post('/forums', [getUser], forumController.create)
  router.get('/forums', forumController.getAll)
  router.get('/forums/:id', forumController.getById)
  router.put('/forums/:id', [getUser], forumController.update)
  router.delete('/forums/:id', [getUser], forumController.remove)
  router.post('/forums/comments', [getUser], forumController.createComment)
  router.get('/forums/:id/comments', forumController.getComments)
  router.delete(
    '/forums/:idForum/comments/:idComment',
    [getUser],
    forumController.removeComment
  )

  // Выборка по всем мартериалам
  router.get('/materials', materialController.getAll)

  // Обратная связь
  router.get('/feedback', feedbackController.getAll)
  router.post('/feedback', [getUser], feedbackController.update)

  return router
}
