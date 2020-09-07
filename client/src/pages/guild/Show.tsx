import React from "react"
import Spinner from "../../components/spinner/Spinner"
import {CommentGuild, Guild, guildKitToString, guildStatusToString} from "../../../../server/src/common/entity/types"
import UserContext from "../../utils/userContext"
import AlertDanger from "../../components/alert-danger/AlertDanger"
import CommentForm from "../../components/commentFrom/CommentForm"
import Comment from "../../components/comment/Comment"
import {Col, Row} from "react-bootstrap"
import GuildApi from "../../api/GuildApi"
import InfoBlockInline from "../../components/show/InfoBlockInline"
import InfoBlock from "../../components/show/InfoBlock"
import Title from "../../components/show/Title"
import SubTitle from "../../components/show/SubTitle"
import Motto from "../../components/show/Motto"
import icon from './img/guild.svg'
import ideologyIcon from './img/ideology.svg'
import kitIcon from './img/kit.svg'
import statusIcon from '../../img/status.svg'
import history from "../../utils/history"
import PageTitle from "../../components/pageTitle/PageTitle"
import ControlButton from "../../components/show/ControlButton"
import ConfirmationWindow from "../../components/confirmationWindow/ConfirmationWindow"
import Avatar from "../../components/show/Avatar"
import Block from "../../components/list/Block"

type S = {
    isLoaded: boolean
    modalShow: boolean
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
            modalShow: false,
            errorMessage: '',
            id: props.match.params.id,
            guild: new Guild(),
            comments: [],
        }
    }

    static getDerivedStateFromProps(nextProps: any, prevState: S) {
        if (nextProps.match.params.id !== prevState.id) {
            if (isNaN(Number(nextProps.match.params.id))) {
                history.push('/')
            }
            return {
                id: nextProps.match.params.id
            }
        }

        return null
    }

    componentDidMount() {
        this.updateData()
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<S>) {
        if (prevProps.match.params.id !== this.state.id) {
            this.setState({
                isLoaded: false,
            })
            this.updateData()
        }
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

    handleRemove = () => {
        this.setState({
            modalShow: false,
            isLoaded: false
        })
        this.guildApi.remove(this.state.id).then(() => {
            history.push('/material/guild')
        }, (err) => {
            this.setState({
                errorMessage: err,
            })
        }).finally(() => {
            this.setState({
                isLoaded: true,
            })
        })
    }

    hideRemoveWindow = () => {
        this.setState({
            modalShow: false
        })
    }

    showRemoveWindow = () => {
        this.setState({
            modalShow: true
        })
    }

    render() {
        if (!!this.state.errorMessage) {
            return (<AlertDanger>{this.state.errorMessage}</AlertDanger>)
        }

        return (
            <div className="page-guild">
                {!this.state.isLoaded && <Spinner/>}
                <ConfirmationWindow onAccept={this.handleRemove} onDecline={this.hideRemoveWindow}
                                    show={this.state.modalShow} title="Вы действительно хотите удалить гильдию?"/>
                <PageTitle title="Гильдия" icon={icon}>
                    <ControlButton show={this.context.user.id === this.state.guild.idAccount} id={this.state.id}
                                   type='guild' nameRemove='гильдию'
                                   showRemoveWindow={this.showRemoveWindow}/>
                </PageTitle>
                <Row>
                    <Col md={4}>
                        <Avatar src={this.state.guild.urlAvatar}/>
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
                <Row>
                    {this.state.guild.members.map(el =>
                        (<Block key={el.id} id={el.id} title='' muteTitle=''
                                urlAvatar={el.urlAvatar} href="/material/character/" size={2}/>)
                    )}
                </Row>
                <div className="comments">
                    {this.state.comments.map((c) =>
                        <Comment key={c.id} {...c}/>
                    )}
                </div>
                {(!this.state.guild.comment && this.context.user.id !== -1) &&
                <CommentForm onCommentUpdate={this.updateComment} onSendComment={this.handleSendComment}/>}

            </div>
        )
    }
}

export default GuildPage