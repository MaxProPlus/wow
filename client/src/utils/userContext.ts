import React from "react"
import {Account} from "../../../server/src/common/entity/types"

const UserContext = React.createContext({
    user: new Account(), updateLogin: () => {
    }
})

export default UserContext

