import Mapper from '../mappers/right'

class RightModel {
    private mapper: Mapper

    constructor(connection: any) {
        this.mapper = new Mapper(connection.getPoolPromise())
    }

    getRights = (id: number) => {
        return this.mapper.selectRights(id)
    }

    ticketRead = (id: number): Promise<boolean> => {
        return this.mapper.checkRight('TICKET_READ', id)
    }

    ticketUpdateStatus = (id: number): Promise<boolean> => {
        return this.mapper.checkRight('TICKET_UPDATE_STATUS', id)
    }

    feedbackEdit = (id: number): Promise<boolean> => {
        return this.mapper.checkRight('FEEDBACK_EDIT', id)
    }
}

export default RightModel