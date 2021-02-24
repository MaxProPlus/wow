import {
  CommentTicket,
  Ticket,
  TicketStatus,
} from '../../../server/src/common/entity/types'
import Api from './BasicApi'

class TicketApi extends Api {
  // Создать тикет
  create(ticket: Ticket) {
    const url = '/api/tickets'
    return this.post(url, ticket).then((r) => {
      if (r.status !== 'OK') return Promise.reject(r.errorMessage)
      return r.results[0]
    })
  }

  // Дополнить комментарием
  addComment(comment: CommentTicket) {
    const url = '/api/tickets/comments'
    return this.post(url, comment).then((r) => {
      if (r.status !== 'OK') return Promise.reject(r.errorMessage)
      return Promise.resolve()
    })
  }

  changeStatus(idTicket: string, status: TicketStatus) {
    const url = '/api/tickets/' + idTicket
    return this.post(url, {status}).then((r) => {
      if (r.status !== 'OK') return Promise.reject(r.errorMessage)
      return Promise.resolve()
    })
  }

  getComments(idTicket: string) {
    const url = '/api/tickets/' + idTicket + '/comments'
    return this.get(url).then((r) => {
      if (r.status !== 'OK') return Promise.reject(r.errorMessage)
      return r.results
    })
  }

  // получить тикет
  getTicket(idTicket: string) {
    const url = '/api/tickets/' + idTicket
    return this.get(url).then((r) => {
      if (r.status !== 'OK') return Promise.reject(r.errorMessage)
      return r.results
    })
  }

  // получить список категориев тикетов
  getTicketsTypeList() {
    const url = '/api/ticket_types'
    return this.get(url).then((r) => {
      if (r.status !== 'OK') return Promise.reject(r.errorMessage)
      return r.results
    })
  }

  // получить тикеты по категории
  getTicketsByType(idType: string, limit: number, page: number) {
    const url = `/api/tickets/types/${idType}?limit=${limit}&page=${page}`
    return this.get(url).then((r) => {
      if (r.status !== 'OK') return Promise.reject(r.errorMessage)
      return r.results
    })
  }
}

export default TicketApi
