import React from "react"
import Spinner from "../../components/spinner/Spinner"
import {CommentGuild, Guild, guildKitToString, guildStatusToString} from "../../../../server/src/common/entity/types"
import UserContext from "../../utils/userContext"
import AlertDanger from "../../components/alert-danger/AlertDanger"
import Button from "../../components/button/Button"
import CommentForm from "../../components/commentFrom/CommentForm"
import Comment from "../../components/comment/Comment"
import {Col, Row} from "react-bootstrap"
import GuildApi from "../../api/guildApi"
import './Show.scss'
import InfoBlockInline from "../../components/show/InfoBlockInline"
import InfoBlock from "../../components/show/InfoBlock"
import Title from "../../components/show/Title"
import SubTitle from "../../components/show/SubTitle"
import Motto from "../../components/show/Motto"
import icon from './img/guild.svg'
import ideologyIcon from './img/ideology.svg'
import kitIcon from './img/kit.svg'
import statusIcon from './img/status.svg'

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
                            <Button to={`/material/guild/edit/${this.state.id}`}>Редактировать</Button>}
                            {this.context.user.id === this.state.guild.idAccount &&
                            <Button>Удалить гильдию</Button>}
                        </div>
                    </div>
                    <Row>
                        <Col md={4}>
                            <img className="guild-avatar" src={this.state.guild.urlAvatar} alt=""/>
                        </Col>
                        <Col md={8}>
                            <Title>{this.state.guild.title}</Title>
                            <SubTitle>{this.state.guild.gameTitle}</SubTitle>
                            <Motto>{this.state.guild.shortDescription}</Motto>
                            <InfoBlockInline icon={ideologyIcon} title="Мировоззрение"
                                             value={this.state.guild.ideology}/>
                            <InfoBlockInline icon={kitIcon} title="Набор"
                                             value={guildKitToString(this.state.guild.kit)}/>
                            <InfoBlockInline icon={statusIcon} title="Статус"
                                             value={guildStatusToString(this.state.guild.status)}/>
                        </Col>
                    </Row>
                    <InfoBlock title="Описание и история" value={this.state.guild.description}/>
                    <InfoBlock title="Условия и правила" value={this.state.guild.rule}/>
                    <InfoBlock title="Дополнительные сведения" value={this.state.guild.more}/>
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