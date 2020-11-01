import React, {Component} from 'react'

type S = {}

class ListOfAdmins extends Component<{}, S> {
    constructor(props: {}) {
        super(props)
        this.state = {}
    }

    render() {
        return (
            <div>
                Список админов
            </div>
        )
    }
}

export default ListOfAdmins