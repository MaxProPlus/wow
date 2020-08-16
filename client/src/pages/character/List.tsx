import React, {Component} from "react"
import CharacterApi from "../../api/CharacterApi"
import {Character} from "../../../../server/src/common/entity/types"
import {Link} from "react-router-dom"
import {Col, Row} from "react-bootstrap"
import Button from "../../components/button/Button"
import Spinner from "../../components/spinner/Spinner"
import icon from "./img/char.svg"
import styles from "./List.module.scss"

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
            <div className="character-list">
                {!this.state.isLoaded && <Spinner/>}
                <div className={`page-title ${styles.list}`}>
                    <h1>
                        <img src={icon} alt=""/>Персонажи</h1>
                    <div className="d-flex">
                        <Button to="/material/character/create">Создать персонажа</Button>
                    </div>
                </div>
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
        // <Col lg={4}>
        //     <div className="character">
        //         <Link to={"/material/character/" + props.id}>
        //             <img src={props.urlAvatar} alt=""/>
        //             <div className="title">{props.title}</div>
        //             <div className="nickname">{props.nickname}</div>
        //         </Link>
        //     </div>
        // </Col>
        <Col className={styles.blockCharacter} lg={3}>
            <Link to={"/material/character/" + props.id}>
                <img src={props.urlAvatar} alt=""/>
                <div className={styles.block__background}/>
                <div className={styles.blockCharacter__title}>{props.title}</div>
                <div className={styles.blockCharacter__gameTitle}>{props.nickname}</div>
            </Link>
        </Col>
    )
}

export default CharacterList