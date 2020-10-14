import React from "react"
import {User} from "../../../server/src/common/entity/types"

// Контекст пользователя
const UserContext = React.createContext({
    user: new User(), updateLogin: () => {
    }
})

export default UserContext

