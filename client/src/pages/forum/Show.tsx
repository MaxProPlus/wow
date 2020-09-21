import React from "react"
import Spinner from "../../components/spinner/Spinner"
import {CommentForum, Forum} from "../../../../server/src/common/entity/types"
import UserContext from "../../utils/userContext"
import AlertDanger from "../../components/alert-danger/AlertDanger"
import CommentForm from "../../components/commentFrom/CommentForm"
import Comment from "../../components/comment/Comment"
import icon from "./img/forum.svg"
import InfoBlock from "../../components/show/InfoBlock"
import Title from "../../components/show/Title"
import ConfirmationWindow from "../../components/confirmationWindow/ConfirmationWindow"
import history from "../../utils/history"
import PageTitle from "../../components/pageTitle/PageTitle"
import ControlButton from "../../components/show/ControlButton"
import Avatar from "../../components/show/Avatar"
import ForumApi from "../../api/ForumApi"
import SubTitle from "../../components/show/SubTitle"

type S = {
    isLoaded: boolean
    modalShow: boolean
    errorMessage: string
    id: string
    forum: Forum
    comments: CommentForum[]
}

class ForumPage extends React.Component<any, S> {
    static contextType = UserContext
    private forumApi = new ForumApi()

    constructor(props: any) {
        super(props)
        this.state = {
            isLoaded: false,
            modalShow: false,
            errorMessage: '',
            id: props.match.params.id,
            forum: new Forum(),
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
        this.forumApi.getById(this.state.id).then(r => {
            this.setState({
                forum: r[0],
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
        this.forumApi.getComments(this.state.id).then(r => {
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

    handleSendComment = (comment: CommentForum) => {
        comment.idForum = this.state.forum.id
        return this.forumApi.addComment(comment)
    }

    handleRemove = () => {
        this.setState({
            modalShow: false,
            isLoaded: false
        })
        this.forumApi.remove(this.state.id).then(() => {
            history.push('/material/forum')
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
            <div>
                {!this.state.isLoaded && <Spinner/>}
                <ConfirmationWindow onAccept={this.handleRemove} onDecline={this.hideRemoveWindow}
                                    show={this.state.modalShow} title="Вы действительно хотите удалить обсуждение?"/>
                <div>
                    <PageTitle title="Обсуждение" icon={icon}>
                        <ControlButton show={this.context.user.id === this.state.forum.idAccount} id={this.state.id}
                                       type="forum" nameRemove='обсуждение'
                                       showRemoveWindow={this.showRemoveWindow}/>
                    </PageTitle>
                    <Avatar src={this.state.forum.urlAvatar}/>
                    <Title className="text-center">{this.state.forum.title}</Title>
                    <SubTitle className="text-center">{this.state.forum.shortDescription}</SubTitle>
                    <InfoBlock title={this.state.forum.description} value={this.state.forum.rule}/>

                    <div className="comments">
                        {this.state.comments.map((c) =>
                            <Comment key={c.id} {...c}/>
                        )}
                    </div>
                    {(!this.state.forum.comment && this.context.user.id !== -1) &&
                    <CommentForm onCommentUpdate={this.updateComment} onSendComment={this.handleSendComment}/>}

                </div>
            </div>
        )
    }
}

export default ForumPage