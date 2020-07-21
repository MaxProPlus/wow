import React from "react"
import {Account} from "../../../server/src/common/entity/types"

export default React.createContext({
    user: new Account(), updateLogin: () => {
    }
})