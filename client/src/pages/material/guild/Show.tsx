import React from 'react'
import Spinner from '../../../components/spinner/Spinner'
import {
    CommentGuild,
    Guild,
    guildKitToString,
    guildStatusToString,
    User,
} from '../../../../../server/src/common/entity/types'
import UserContext from '../../../contexts/userContext'
import AlertDanger from '../../../components/alert-danger/AlertDanger'
import CommentForm from '../../../components/commentFrom/CommentForm'
import CommentComponent from '../../../components/comment/Comment'
import {Col, Row} from 'react-bootstrap'
import GuildApi from '../../../api/GuildApi'
import InfoBlockInline from '../../../components/show/InfoBlockInline'
import InfoBlock from '../../../components/show/InfoBlock'
import Title from '../../../components/show/Title'
import SubTitle from '../../../components/show/SubTitle'
import Motto from '../../../components/show/Motto'
import icon from './img/guild.svg'
import ideologyIcon from './img/ideology.svg'
import kitIcon from './img/kit.svg'
import statusIcon from '../../../img/status.svg'
import history from '../../../utils/history'
import PageTitle from '../../../components/pageTitle/PageTitle'
import ControlButton from '../../../components/show/ControlButton'
import ConfirmationWindow from '../../../components/confirmationWindow/ConfirmationWindow'
import Avatar from '../../../components/show/Avatar'
import Card from '../../../components/show/Card'
import List from '../../../components/show/List'
import {MatchId} from '../../../types/RouteProps'
import {RouteComponentProps} from 'react-router-dom'
import Page from '../../../components/page/Page'

type P = RouteComponentProps<MatchId>

type S = {
    isLoaded: boolean
    isAdmin: boolean
    modalShow: boolean
    errorMessage: string
    id: string
    guild: Guild
    comments: CommentGuild[]
}

class GuildPage extends React.Component<P, S> {
    static contextType = UserContext
    private guildApi = new GuildApi()

    constructor(props: P) {
        super(props)
        this.state = {
            isLoaded: false,
            isAdmin: false,
            modalShow: false,
            errorMessage: '',
            id: props.match.params.id,
            guild: new Guild(),
            comments: [],
        }
    }

    static getDerivedStateFromProps(nextProps: P, prevState: S) {
        // Проверка изменения url
        if (nextProps.match.params.id !== prevState.id) {
            if (isNaN(Number(nextProps.match.params.id))) {
                history.push('/')
            }
            return {
                id: nextProps.match.params.id,
            }
        }
        return null
    }

    componentDidMount() {
        this.updateData()
    }

    componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>) {
        // Проверить есть ли права на редактирование
        if (!this.state.isAdmin && this.context.user.id > 0) {
            const isAdmin = ((this.state.guild.coauthors.findIndex((el: User) => {
                return el.id === this.context.user.id
            }) === -1) ? this.context.user.id === this.state.guild.idUser : true)
            if (isAdmin) {
                this.setState({
                    isAdmin,
                })
            }
        }
        // Проверка изменения url
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
                errorMessage: err,
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
            isLoaded: false,
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
            modalShow: false,
        })
    }

    showRemoveWindow = () => {
        this.setState({
            modalShow: true,
        })
    }

    render() {
        if (!!this.state.errorMessage) {
            return (<AlertDanger>{this.state.errorMessage}</AlertDanger>)
        }

        return (
            <Page>
                {!this.state.isLoaded && <Spinner/>}
                <ConfirmationWindow onAccept={this.handleRemove} onDecline={this.hideRemoveWindow}
                                    show={this.state.modalShow} title="Вы действительно хотите удалить гильдию?"/>
                <PageTitle title="Гильдия" icon={icon}>
                    <ControlButton show={this.state.isAdmin} id={this.state.id}
                                   href="/material/guild" nameRemove="Удалить гильдию"
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
                <InfoBlock title="Описание и история">{this.state.guild.description}</InfoBlock>
                <InfoBlock title="Условия и правила">{this.state.guild.rule}</InfoBlock>
                <InfoBlock title="Дополнительные сведения">{this.state.guild.more}</InfoBlock>
                <Card title="Участники" href="/material/character/" list={this.state.guild.members}/>
                <List title="Сюжеты" href="/material/story/" list={this.state.guild.stores}/>
                <div className="comments">
                    {this.state.comments.map((c) =>
                        <CommentComponent key={c.id} {...c}/>,
                    )}
                </div>
                {(!this.state.guild.comment && this.context.user.id !== -1) &&
                <CommentForm onCommentUpdate={this.updateComment} onSendComment={this.handleSendComment}/>}
            </Page>
        )
    }
}

export default GuildPage