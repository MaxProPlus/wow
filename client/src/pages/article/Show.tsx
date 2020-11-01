import React from 'react'
import {RouteComponentProps} from 'react-router-dom'
import {MatchId} from '../../types/RouteProps'
import {Article, CommentArticle} from '../../../../server/src/common/entity/types'
import UserContext from '../../contexts/userContext'
import history from '../../utils/history'
import AlertDanger from 'components/alert-danger/AlertDanger'
import Spinner from '../../components/spinner/Spinner'
import ConfirmationWindow from '../../components/confirmationWindow/ConfirmationWindow'
import PageTitle from '../../components/pageTitle/PageTitle'
import ControlButton from '../../components/show/ControlButton'
import Avatar from '../../components/show/Avatar'
import Title from '../../components/show/Title'
import SubTitle from '../../components/show/SubTitle'
import InfoBlock from '../../components/show/InfoBlock'
import CommentForm from 'components/commentFrom/CommentForm'
import Comment from '../../components/comment/Comment'
import ArticleApi from '../../api/ArticleApi'
import Page from '../../components/page/Page'

type P = RouteComponentProps<MatchId>

type S = {
    isLoaded: boolean
    isAdmin: boolean
    modalShow: boolean
    errorMessage: string
    id: string
    article: Article
    comments: CommentArticle[]
}

class ArticlePage extends React.Component<P, S> {
    static contextType = UserContext
    private forumApi = new ArticleApi()

    constructor(props: any) {
        super(props)
        this.state = {
            isLoaded: false,
            isAdmin: false,
            modalShow: false,
            errorMessage: '',
            id: props.match.params.id,
            article: new Article(),
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
            const isAdmin = this.context.user.id === this.state.article.idUser
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
        this.forumApi.getById(this.state.id).then(r => {
            this.setState({
                article: r[0],
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

    handleSendComment = (comment: CommentArticle) => {
        comment.idArticle = this.state.article.id
        return this.forumApi.addComment(comment)
    }

    handleRemove = () => {
        this.setState({
            modalShow: false,
            isLoaded: false,
        })
        this.forumApi.remove(this.state.id).then(() => {
            history.push('/article')
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
                                    show={this.state.modalShow} title="Вы действительно хотите новость?"/>
                <div>
                    <PageTitle title="Новость" icon="">
                        <ControlButton show={this.state.isAdmin} id={this.state.id}
                                       href="/article" nameRemove="Удалить новость"
                                       showRemoveWindow={this.showRemoveWindow}/>
                    </PageTitle>
                    <Avatar src={this.state.article.urlAvatar}/>
                    <Title className="text-center">{this.state.article.title}</Title>
                    <SubTitle className="text-center">{this.state.article.shortDescription}</SubTitle>
                    <InfoBlock title="">{this.state.article.description}</InfoBlock>

                    <div className="comments">
                        {this.state.comments.map((c) =>
                            <Comment key={c.id} {...c}/>,
                        )}
                    </div>
                    {(!this.state.article.comment && this.context.user.id !== -1) &&
                    <CommentForm onCommentUpdate={this.updateComment} onSendComment={this.handleSendComment}/>}
                </div>
            </Page>
        )
    }
}

export default ArticlePage