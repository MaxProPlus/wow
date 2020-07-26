import {Comment, Ticket, TicketStatus} from "../../../server/src/common/entity/types"

class TicketApi {
    // Создать тикет
    create(ticket: Ticket) {
        let url = '/api/tickets'
        return fetch(url, {
            method: 'POST',
            body: JSON.stringify(ticket),
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(r => {
            if (!r.ok) {
                return {
                    status: "ERROR_SERVER",
                    errorMessage: `${r.status} ${r.statusText}`
                }
            }
            return r.json()
        })
    }

    // Дополнить комментарием
    addComment(comment: Comment) {
        let url = '/api/tickets/comments'
        return fetch(url, {
            method: 'POST',
            body: JSON.stringify(comment),
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(r => {
            if (!r.ok) {
                return {
                    status: "ERROR_SERVER",
                    errorMessage: `${r.status} ${r.statusText}`
                }
            }
            return r.json()
        })
    }

    changeStatus(idTicket: string, status: TicketStatus) {
        let url = '/api/tickets/'+idTicket
        return fetch(url, {
            method: 'POST',
            body: JSON.stringify({status}),
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(r => {
            if (!r.ok) {
                return {
                    status: "ERROR_SERVER",
                    errorMessage: `${r.status} ${r.statusText}`
                }
            }
            return r.json()
        })
    }

    getComments(idTicket: string) {
        let url = '/api/tickets/' + idTicket + '/comments'
        return fetch(url, {
            method: 'GET'
        }).then(r => {
            if (!r.ok) {
                return {
                    status: "ERROR_SERVER",
                    errorMessage: `${r.status} ${r.statusText}`
                }
            }
            return r.json()
        })
    }

    // получить тикет
    getTicket(idTicket: string) {
        let url = '/api/tickets/' + idTicket
        return fetch(url, {
            method: 'GET'
        }).then(r => {
            if (!r.ok) {
                return {
                    status: "ERROR_SERVER",
                    errorMessage: `${r.status} ${r.statusText}`
                }
            }
            return r.json()
        })
    }

    // получить список категориев тикетов
    getTicketsTypeList() {
        let url = '/api/ticket_types'
        return fetch(url, {
            method: 'GET'
        }).then(r => {
            if (!r.ok) {
                return {
                    status: "ERROR_SERVER",
                    errorMessage: `${r.status} ${r.statusText}`
                }
            }
            return r.json()
        })
    }

    // получить тикеты по категории
    getTicketsByType(idType: string, limit: number, page: number) {
        const url = `/api/tickets/types/${idType}?limit=${limit}&page=${page}`
        return fetch(url, {
            method: 'GET'
        }).then(r => {
            if (!r.ok) {
                return {
                    status: "ERROR_SERVER",
                    errorMessage: `${r.status} ${r.statusText}`
                }
            }
            return r.json()
        })
    }
}

export default TicketApi