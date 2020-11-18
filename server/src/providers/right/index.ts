import RightRepository from '../../repositories/right'

class RightProvider {
    private repository: RightRepository

    constructor(connection: any) {
        this.repository = new RightRepository(connection.getPoolPromise())
    }

    getRights = (id: number): Promise<string[]> => {
        return this.repository.selectRights(id).then(r => r, () => [])
    }

    ticketRead = (id: number): Promise<boolean> => {
        return this.repository.checkRight('TICKET_READ', id).then(r => r, () => false)
    }

    ticketUpdateStatus = (id: number): Promise<boolean> => {
        return this.repository.checkRight('TICKET_UPDATE_STATUS', id).then(r => r, () => false)
    }

    feedbackEdit = (id: number): Promise<boolean> => {
        return this.repository.checkRight('FEEDBACK_EDIT', id).then(r => r, () => false)
    }

    articleCrud = (id: number): Promise<boolean> => {
        return this.repository.checkRight('ARTICLE_CRUD', id).then(r => r, () => false)
    }

    moderateComment = (id: number): Promise<boolean> => {
        return this.repository.checkRight('MODERATE_COMMENT', id).then(r => r, () => false)
    }
}

export default RightProvider