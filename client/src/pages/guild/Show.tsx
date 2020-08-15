import React from "react"
import Spinner from "../../components/spinner/Spinner"
import {CommentGuild, Guild, guildKitToString, guildStatusToString} from "../../../../server/src/common/entity/types"
import UserContext from "../../utils/userContext"
import AlertDanger from "../../components/alert-danger/AlertDanger"
import Button from "../../components/button/Button"
import {Link} from "react-router-dom"
import CommentForm from "../../components/commentFrom/CommentForm"
import Comment from "../../components/comment/Comment"
import {Col, Row} from "react-bootstrap"
import GuildApi from "../../api/guildApi"
import './Show.scss'
import icon from './guild.svg'

type S = {
    isLoaded: boolean
    errorMessage: string
    id: string
    guild: Guild
    comments: CommentGuild[]
}

class GuildPage extends React.Component<any, S> {
    static contextType = UserContext
    private guildApi = new GuildApi()

    constructor(props: any) {
        super(props)
        this.state = {
            isLoaded: false,
            errorMessage: '',
            id: props.match.params.id,
            guild: new Guild(),
            comments: [],
        }
    }

    componentDidMount() {
        this.updateData()
    }

    updateData = () => {
        this.guildApi.getById(this.state.id).then(r => {
            this.setState({
                guild: r[0],
                // comments: r[1],
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
        this.guildApi.getComments(this.state.id).then(r => {
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

    handleSendComment = (comment: CommentGuild) => {
        comment.idGuild = this.state.guild.id
        return this.guildApi.addComment(comment)
    }

    render() {
        if (!!this.state.errorMessage) {
            return (<AlertDanger>{this.state.errorMessage}</AlertDanger>)
        }

        return (
            <div>
                {!this.state.isLoaded && <Spinner/>}
                <div className="page-guild">
                    <div className="page-title">
                        <h1>
                            <img src={icon} alt=""/>
                            Гильдии
                        </h1>
                        <div className="d-flex justify-content-end">
                            {this.context.user.id === this.state.guild.idAccount &&
                            <Link className="btn" to={`/material/guild/edit/${this.state.id}`}>Редактировать</Link>}
                            {this.context.user.id === this.state.guild.idAccount &&
                            <Button>Удалить гильдию</Button>}
                        </div>
                    </div>
                    {/*<div className="nickname">{this.state.guild.nickname}</div>*/}
                    <Row>
                        <Col md={4}>
                            <img className="guild-avatar" src={this.state.guild.urlAvatar} alt=""/>
                        </Col>
                        <Col md={8}>
                            <Row>
                                <Col>
                                    {this.state.guild.title}
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    {this.state.guild.gameTitle}
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    {this.state.guild.shortDescription}
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={4}>
                                    Мировоззрение
                                </Col>
                                <Col xs={8}>
                                    {this.state.guild.ideology}
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={4}>
                                    Набор
                                </Col>
                                <Col xs={8}>
                                    {guildKitToString(this.state.guild.kit)}
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={4}>
                                    Статус
                                </Col>
                                <Col xs={8}>
                                    {guildStatusToString(this.state.guild.status)}
                                </Col>
                            </Row>

                        </Col>
                    </Row>
                    <div className="block">
                        <div className="block__title">Описание и история</div>
                        <div className="block__description">
                            {this.state.guild.description}
                        </div>
                    </div>
                    <div className="block">
                        <div className="block__title">Условия и правила</div>
                        <div className="block__description">
                            {this.state.guild.rule}
                        </div>
                    </div>
                    <div className="block">
                        <div className="block__title">Дополнительные сведения</div>
                        <div className="block__description">
                            {this.state.guild.more}
                        </div>
                    </div>

                    <div className="comments">
                        {this.state.comments.map((c) =>
                            <Comment key={c.id} {...c}/>
                        )}
                    </div>
                    {(!this.state.guild.comment && this.context.user.id !== -1) &&
                    <CommentForm onCommentUpdate={this.updateComment} onSendComment={this.handleSendComment}/>}

                </div>
            </div>
        )
    }
}

export default GuildPage