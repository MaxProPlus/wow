import RightRepository from '../../repositories/right'

class RightProvider {
    private repository: RightRepository

    constructor(connection: any) {
        this.repository = new RightRepository(connection.getPoolPromise())
    }

    getRights = (id: number): Promise<string[]> => {
        return this.repository.selectRights(id).then(r => r, () => [])
    }

    ticketModerator = (id: number): Promise<boolean> => {
        return this.repository.checkRight('TICKET_MODERATOR', id).then(r => r, () => false)
    }

    feedbackModerator = (id: number): Promise<boolean> => {
        return this.repository.checkRight('FEEDBACK_MODERATOR', id).then(r => r, () => false)
    }

    articleModerator = (id: number): Promise<boolean> => {
        return this.repository.checkRight('ARTICLE_MODERATOR', id).then(r => r, () => false)
    }

    commentModerator = (id: number): Promise<boolean> => {
        return this.repository.checkRight('COMMENT_MODERATOR', id).then(r => r, () => false)
    }
}

export default RightProvider