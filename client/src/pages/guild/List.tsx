import React, {Component} from "react"
import {Link} from "react-router-dom"

type S = {

}

class GuildList extends Component<any, S> {

    render() {
        return (
            <div className="guild-list">
                <Link to="/material/guild/create">Создать гильдию</Link>
            </div>
        )
    }
}

export default GuildList