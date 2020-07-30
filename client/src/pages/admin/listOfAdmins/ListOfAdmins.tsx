import React, {Component} from "react";

type IState = {}

class ListOfAdmins extends Component<{}, IState> {
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