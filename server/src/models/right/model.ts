import Mapper from './mapper'

class RightModel {
    private mapper: Mapper

    constructor(connection: any) {
        this.mapper = new Mapper(connection.getPoolPromise())
    }

    getRights = (idAccount: number) => {
        return this.mapper.selectRights(idAccount)
    }

    ticketRead = (idAccount: number):Promise<boolean> =>{
        return this.mapper.checkRight('TICKET_READ', idAccount)
    }

    ticketUpdateStatus = (idAccount: number):Promise<boolean> =>{
        return this.mapper.checkRight('TICKET_UPDATE_STATUS', idAccount)
    }
}

export default RightModel