import React from "react"
import Spinner from "../../components/spinner/Spinner"
import {
    activeToString,
    Character,
    characterStatusToString,
    CommentCharacter,
    sexToString
} from "../../../../server/src/common/entity/types"
import UserContext from "../../utils/userContext"
import CharacterApi from "../../api/CharacterApi"
import AlertDanger from "../../components/alert-danger/AlertDanger"
import './Show.scss'
import Button from "../../components/button/Button"
import {Link} from "react-router-dom"
import CommentForm from "../../components/commentFrom/CommentForm"
import Comment from "../../components/comment/Comment"
import {Col, Row} from "react-bootstrap"
import icon from "../guild/guild.svg"

type IState = {
    isLoaded: boolean
    errorMessage: string
    id: string
    character: Character
    comments: CommentCharacter[]
}

class CharacterPage extends React.Component<any, IState> {
    static contextType = UserContext
    private characterApi = new CharacterApi()

    constructor(props: any) {
        super(props)
        this.state = {
            isLoaded: false,
            errorMessage: '',
            id: props.match.params.id,
            character: new Character(),
            comments: [],
        }
    }

    componentDidMount() {
        this.updateData()
    }

    updateData = () => {
        this.characterApi.getById(this.state.id).then(r => {
            this.setState({
                character: r[0],
                comments: r[1],
            })
        }, err => {
            this.setState({
                errorMessage: err
            })
        }).finally(() => {
            this.setState({
                isLoaded: true,
            })
        })
    }

    updateComment = () => {
        this.setState({
            isLoaded: false,
        })
        this.characterApi.getComments(this.state.id).then(r => {
            this.setState({
                comments: r,
            })
        }, err => {
            this.setState({
                errorMessage: err,
            })
        }).finally(() => {
            this.setState({
                isLoaded: true,
            })
        })

    }

    handleSendComment = (comment: CommentCharacter) => {
        comment.idCharacter = this.state.character.id
        return this.characterApi.addComment(comment)
    }

    render() {
        if (!!this.state.errorMessage) {
            return (<AlertDanger>{this.state.errorMessage}</AlertDanger>)
        }

        return (
            <div>
                {!this.state.isLoaded && <Spinner/>}
                <div className="page-character">
                    <div className="page-title">
                        <h1>
                            <img src={icon} alt=""/>
                            Персонажи
                        </h1>
                        <div className="d-flex justify-content-end">
                            {this.context.user.id === this.state.character.idAccount &&
                            <Link className="btn" to={`/material/character/edit/${this.state.id}`}>Редактировать</Link>}
                            {this.context.user.id === this.state.character.idAccount &&
                            <Button>Удалить персонажа</Button>}
                        </div>
                    </div>
                    <Row>
                        <Col md={4}>
                            <img className="character-avatar" src={this.state.character.urlAvatar} alt=""/>
                        </Col>
                        <Col md={8}>
                            <Row>
                                <Col xs={4}>
                                    Раса
                                </Col>
                                <Col xs={8}>
                                    {this.state.character.race}
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={4}>
                                    Пол
                                </Col>
                                <Col xs={8}>
                                    {sexToString(this.state.character.sex)}
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={4}>
                                    Возраст
                                </Col>
                                <Col xs={8}>
                                    {this.state.character.age}
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={4}>
                                    Нация
                                </Col>
                                <Col xs={8}>
                                    {this.state.character.nation}
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={4}>
                                    Места
                                </Col>
                                <Col xs={8}>
                                    {this.state.character.territory}
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={4}>
                                    Класс
                                </Col>
                                <Col xs={8}>
                                    {this.state.character.className}
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={4}>
                                    Род
                                </Col>
                                <Col xs={8}>
                                    {this.state.character.occupation}
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={4}>
                                    Верования
                                </Col>
                                <Col xs={8}>
                                    {this.state.character.religion}
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={4}>
                                    Знания
                                </Col>
                                <Col xs={8}>
                                    {this.state.character.languages}
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={4}>
                                    Статус
                                </Col>
                                <Col xs={8}>
                                    {characterStatusToString(this.state.character.status)}
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={4}>
                                    Активность
                                </Col>
                                <Col xs={8}>
                                    {activeToString(this.state.character.active)}
                                </Col>
                            </Row>

                        </Col>
                    </Row>
                    <div className="description">
                        {this.state.character.description}
                    </div>

                    <div className="comments">
                        {this.state.comments.map((c) =>
                            <Comment key={c.id} {...c}/>
                        )}
                    </div>
                    {(!this.state.character.comment && this.context.user.id !== -1) &&
                    <CommentForm onCommentUpdate={this.updateComment} onSendComment={this.handleSendComment}/>}

                </div>
            </div>
        )
    }
}

export default CharacterPage