import React from "react"
import {User} from "../../../server/src/common/entity/types"

const UserContext = React.createContext({
    user: new User(), updateLogin: () => {
    }
})

export default UserContext

