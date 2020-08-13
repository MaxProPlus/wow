import React, {Component} from "react"
import CharacterApi from "../../api/CharacterApi"
import {Character} from "../../../../server/src/common/entity/types"
import {Link} from "react-router-dom"
import './List.scss'
import {Col, Row} from "react-bootstrap"
import Button from "../../components/button/Button"
import Spinner from "../../components/spinner/Spinner"

type S = {
    isLoaded: boolean,
    count: number,
    list: Character[],
}


class CharacterList extends Component<any, S> {
    private characterApi = new CharacterApi()
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
        this.characterApi.getAll(this.limit, this.page).then(r => {
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
            <Button onClick={this.handlePageClick} className="more-btn">Загрузить еще</Button> : ''
        return (
            <div className="page-character-list">
                {!this.state.isLoaded && <Spinner/>}
                <Row>
                    <Col><Link to="/material/character/create"><Button>Создать персонажа</Button></Link></Col>
                </Row>
                {this.state.list.length > 0 ?
                    <Row>
                        {this.state.list.map(el =>
                            (<CharacterBlock key={el.id} {...el}/>)
                        )}
                    </Row>
                :
                'Нет перонажей'}
                {more}
            </div>
        )
    }
}

const CharacterBlock = (props: Character) => {
    return (
        <Col lg={4}>
            <div className="character">
                <Link to={"/material/character/" + props.id}>
                    <img src={props.urlAvatar} alt=""/>
                    <div className="title">{props.title}</div>
                    <div className="nickname">{props.nickname}</div>
                </Link>
            </div>
        </Col>
    )
}

export default CharacterList