import React, {Component} from "react"
import {Link} from "react-router-dom"
import {Character, Guild} from "../../../../server/src/common/entity/types";
import CharacterApi from "../../api/CharacterApi";
import GuildApi from "../../api/guildApi";
import Button from "../../components/button/Button";
import {Col, Row} from "react-bootstrap";
import './List.scss'

type S = {
    isLoaded: boolean,
    count: number,
    list: Guild[],

}

class GuildList extends Component<any, S> {
    private guildApi = new GuildApi()
    private page = 1
    private limit = 10

    constructor(props: any) {
        super(props)
        this.state = {
            isLoaded: false,
            count: 0,
            list: [],
        }
    }

    componentDidMount() {
        this.updateData()
    }


    updateData = () => {
        this.guildApi.getAll(this.limit, this.page).then(r => {
            this.setState((prevState: S) => {
                return {
                    list: prevState.list.concat(r.data),
                    count: r.count,
                }
            })
        }, (err) => {
            console.error(err)
        }).finally(() => {
            this.setState({
                isLoaded: true,
            })
        })
    }

    handlePageClick = () => {
        this.setState({
            isLoaded: false,
        })
        this.page += 1
        this.updateData()
    }

    render() {
        const more = this.limit * this.page < this.state.count ?
            <Button onClick={this.handlePageClick} className="more-btn">Загрузить еще</Button> : undefined
        return (
            <div className="guild-list">
                <Link to="/material/guild/create">Создать гильдию</Link>
                {this.state.list.length > 0 ?
                    <Row>
                        {this.state.list.map(el =>
                            (<GuildBlock key={el.id} {...el}/>)
                        )}
                    </Row>
                    :
                    'Нет перонажей'}
                {more}
            </div>
        )
    }
}

const GuildBlock = (props: Guild) => {
    return (
        <Col lg={4}>
            <div className="guild">
                <Link to={"/material/guild/" + props.id}>
                    <img src={props.urlAvatar} alt=""/>
                    <div className="title">{props.title}</div>
                    <div className="game-title">{props.gameTitle}</div>
                </Link>
            </div>
        </Col>
    )
}

export default GuildList