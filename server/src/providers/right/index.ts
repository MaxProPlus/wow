import RightRepository from '../../repositories/right'

class RightProvider {
    private repository: RightRepository

    constructor(connection: any) {
        this.repository = new RightRepository(connection.getPoolPromise())
    }

    getRights = (id: number): Promise<string[]> => {
        return this.repository.selectRights(id)
    }

    ticketModerator = (id: number): Promise<boolean> => {
        return this.repository.checkRight('TICKET_MODERATOR', id)
    }

    feedbackModerator = (id: number): Promise<boolean> => {
        return this.repository.checkRight('FEEDBACK_MODERATOR', id)
    }

    articleModerator = (id: number): Promise<boolean> => {
        return this.repository.checkRight('ARTICLE_MODERATOR', id)
    }

    commentModerator = (id: number): Promise<boolean> => {
        return this.repository.checkRight('COMMENT_MODERATOR', id)
    }
}

export default RightProvider