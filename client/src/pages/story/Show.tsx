import React from "react"
import Spinner from "../../components/spinner/Spinner"
import {Account, CommentStory, Story, storyStatusToString} from "../../../../server/src/common/entity/types"
import UserContext from "../../utils/userContext"
import AlertDanger from "../../components/alert-danger/AlertDanger"
import CommentForm from "../../components/commentFrom/CommentForm"
import Comment from "../../components/comment/Comment"
import {Col, Row} from "react-bootstrap"
import InfoBlockInline from "../../components/show/InfoBlockInline"
import InfoBlock from "../../components/show/InfoBlock"
import Title from "../../components/show/Title"
import Motto from "../../components/show/Motto"
import icon from './img/icon.svg'
import StoryApi from "../../api/StoryApi"
import dateIcon from './img/date.svg'
import statusIcon from '../../img/status.svg'
import PageTitle from "../../components/pageTitle/PageTitle"
import ControlButton from "../../components/show/ControlButton"
import ConfirmationWindow from "../../components/confirmationWindow/ConfirmationWindow"
import history from "../../utils/history"
import Avatar from "../../components/show/Avatar"
import Card from "../../components/show/Card"
import List from "../../components/show/List"
import {RouteComponentProps} from "react-router-dom"
import {MatchId} from "../../types/RouteProps"

type P = RouteComponentProps<MatchId>

type S = {
    isLoaded: boolean
    isAdmin: boolean
    modalShow: boolean
    errorMessage: string
    id: string
    story: Story
    comments: CommentStory[]
}

class StoryPage extends React.Component<P, S> {
    static contextType = UserContext
    private storyApi = new StoryApi()

    constructor(props: P) {
        super(props)
        this.state = {
            isLoaded: false,
            isAdmin: false,
            modalShow: false,
            errorMessage: '',
            id: props.match.params.id,
            story: new Story(),
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
                id: nextProps.match.params.id
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
            const isAdmin = ((this.state.story.coauthors.findIndex((el: Account) => {
                return el.id === this.context.user.id
            }) === -1) ? this.context.user.id === this.state.story.idAccount : true)
            if (isAdmin) {
                this.setState({
                    isAdmin
                })
            }
        }
        // Проверка изменения url
        if (prevProps.match.params.id !== this.state.id) {
            this.setState({
                isLoaded: false,
                isAdmin: false
            })
            this.updateData()
        }
    }

    updateData = () => {
        this.storyApi.getById(this.state.id).then(r => {
            this.setState({
                story: r[0],
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
        this.storyApi.getComments(this.state.id).then(r => {
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

    handleSendComment = (comment: CommentStory) => {
        comment.idStory = this.state.story.id
        return this.storyApi.addComment(comment)
    }

    handleRemove = () => {
        this.setState({
            modalShow: false,
            isLoaded: false
        })
        this.storyApi.remove(this.state.id).then(() => {
            history.push('/material/story')
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
                                    show={this.state.modalShow} title="Вы действительно хотите удалить сюжет?"/>
                <PageTitle title="Сюжет" icon={icon}>
                    <ControlButton show={this.state.isAdmin} id={this.state.id}
                                   type='story' nameRemove='сюжет'
                                   showRemoveWindow={this.showRemoveWindow}/>
                </PageTitle>
                <Row>
                    <Col md={4}>
                        <Avatar src={this.state.story.urlAvatar}/>
                    </Col>
                    <Col md={8}>
                        <Title>{this.state.story.title}</Title>
                        <Motto>{this.state.story.shortDescription}</Motto>
                        <InfoBlockInline icon={dateIcon} title="Дата начала"
                                         value={(new Date(this.state.story.dateStart)).toDateString()}/>
                        <InfoBlockInline icon={statusIcon} title="Статус"
                                         value={storyStatusToString(this.state.story.status)}/>
                    </Col>
                </Row>
                <InfoBlock title="Сюжет" value={this.state.story.description}/>
                <InfoBlock title="Условия и правила" value={this.state.story.rule}/>
                <InfoBlock title="Дополнительные сведения" value={this.state.story.more}/>
                <Card title="Участники" href="/material/character/" list={this.state.story.members}/>
                <List title="Гильдии" href="/material/guild/" list={this.state.story.guilds}/>
                <div className="comments">
                    {this.state.comments.map((c) =>
                        <Comment key={c.id} {...c}/>
                    )}
                </div>
                {(!this.state.story.comment && this.context.user.id !== -1) &&
                <CommentForm onCommentUpdate={this.updateComment} onSendComment={this.handleSendComment}/>}
            </div>
        )
    }
}

export default StoryPage