import React, {Component} from "react"
import {Link} from "react-router-dom"
import {Guild} from "../../../../server/src/common/entity/types"
import GuildApi from "../../api/guildApi"
import Button from "../../components/button/Button"
import {Col, Row} from "react-bootstrap"
import styles from './List.module.scss'
import icon from "./img/guild.svg"

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
            <div>
                <div className={`page-title ${styles.list}`}>
                    <h1>
                        <img src={icon} alt=""/>Гильдии</h1>
                    <div className="d-flex">
                        <Button to="/material/guild/create">Создать гильдию</Button>
                    </div>
                </div>
                {this.state.list.length > 0 ?
                    <Row>
                        {this.state.list.map(el =>
                            (<BlockGuild key={el.id} {...el}/>)
                        )}
                    </Row>
                    :
                    'Нет гильдий'}
                {more}
            </div>
        )
    }
}

const BlockGuild = (props: Guild) => {
    return (
        <Col className={styles.blockGuild} lg={4}>
            <Link to={"/material/guild/" + props.id}>
                <img src={props.urlAvatar} alt=""/>
                <div className={styles.block__background}/>
                <div className={styles.blockGuild__title}>{props.title}</div>
                <div className={styles.blockGuild__gameTitle}>{props.gameTitle}</div>
            </Link>
        </Col>
    )
}

export default GuildList