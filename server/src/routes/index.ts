import {Router} from 'express'
import AccountController from '../controllers/AccountController'
import TicketController from '../controllers/TicketController'
import CharacterController from '../controllers/CharacterController'

const router = Router()

const accountController = new AccountController()
const ticketController = new TicketController()
const characterController = new CharacterController()

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

router.post('/tickets', ticketController.create)
router.post('/tickets/comments', ticketController.createComment)
router.get('/ticket_types', ticketController.getTypesOfTicket)
router.get('/tickets/types/:id', ticketController.getTicketsByType)
router.get('/tickets/:id', ticketController.getById)
router.post('/tickets/:id', ticketController.changeStatus)
router.get('/tickets/:idTicket/comments', ticketController.getComments)

router.post('/characters', characterController.create)
router.get('/characters', characterController.getAll)
router.get('/characters/:id', characterController.getById)
router.put('/characters/:id', characterController.update)
// router.delete('/characters', characterController.remove)
// router.post('/characters/comments', characterController.createComment)
// router.get('/characters/:id/comments', characterController.getComments)
// router.delete('/characters/:idCharacter/comments/:idComment', characterController.removeComment)

export default router
