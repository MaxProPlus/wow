import React from 'react'
import Spinner from '../../../components/spinner/Spinner'
import {
  CommentForum,
  Forum,
  User,
} from '../../../../../server/src/common/entity/types'
import UserContext from '../../../contexts/userContext'
import AlertDanger from '../../../components/alertDanger/AlertDanger'
import CommentForm from '../../../components/commentFrom/CommentForm'
import CommentComponent from '../../../components/comment/Comment'
import icon from './img/forum.svg'
import InfoBlock from '../../../components/show/InfoBlock'
import Title from '../../../components/show/Title'
import ConfirmationWindow from '../../../components/confirmationWindow/ConfirmationWindow'
import history from '../../../utils/history'
import PageTitle from '../../../components/pageTitle/PageTitle'
import ControlButton from '../../../components/show/ControlButton'
import {AvatarWidthAuto} from '../../../components/show/Avatar'
import ForumApi from '../../../api/ForumApi'
import SubTitle from '../../../components/show/SubTitle'
import {RouteComponentProps} from 'react-router-dom'
import {MatchId} from '../../../types/RouteProps'
import Page from '../../../components/page/Page'
import About from '../../../components/show/About'

type P = RouteComponentProps<MatchId>

type S = {
  isLoaded: boolean
  isAdmin: boolean
  modalShow: boolean
  errorMessage: string
  id: string
  forum: Forum
  comments: CommentForum[]
}

class ForumPage extends React.Component<P, S> {
  static contextType = UserContext
  private forumApi = new ForumApi()

  constructor(props: any) {
    super(props)
    this.state = {
      isLoaded: false,
      isAdmin: false,
      modalShow: false,
      errorMessage: '',
      id: props.match.params.id,
      forum: new Forum(),
      comments: [],
    }
  }

  static getDerivedStateFromProps(nextProps: Readonly<P>, prevState: S) {
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
      const isAdmin =
        this.state.forum.coauthors.findIndex((el: User) => {
          return el.id === this.context.user.id
        }) === -1
          ? this.context.user.id === this.state.forum.idUser
          : true
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
    this.forumApi
      .getById(this.state.id)
      .then(
        (r) => {
          this.setState({
            forum: r[0],
            comments: r[1],
          })
        },
        (err) => {
          this.setState({
            errorMessage: err,
          })
        }
      )
      .finally(() => {
        this.setState({
          isLoaded: true,
        })
      })
  }

  updateComment = () => {
    this.setState({
      isLoaded: false,
    })
    this.forumApi
      .getComments(this.state.id)
      .then(
        (r) => {
          this.setState({
            comments: r,
          })
        },
        (err) => {
          this.setState({
            errorMessage: err,
          })
        }
      )
      .finally(() => {
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
      isLoaded: false,
    })
    this.forumApi
      .remove(this.state.id)
      .then(
        () => {
          history.push('/material/forum')
        },
        (err) => {
          this.setState({
            errorMessage: err,
          })
        }
      )
      .finally(() => {
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
      return (
        <Page>
          <AlertDanger>{this.state.errorMessage}</AlertDanger>
        </Page>
      )
    }

    return (
      <Page>
        {!this.state.isLoaded && <Spinner />}
        <ConfirmationWindow
          onAccept={this.handleRemove}
          onDecline={this.hideRemoveWindow}
          show={this.state.modalShow}
          title="Вы действительно хотите удалить обсуждение?"
        />
        <div>
          <PageTitle title="Обсуждение" icon={icon}>
            <ControlButton
              show={this.state.isAdmin}
              id={this.state.id}
              href="/material/forum"
              nameRemove="Удалить обсуждение"
              showRemoveWindow={this.showRemoveWindow}
            />
          </PageTitle>
          <AvatarWidthAuto src={this.state.forum.urlAvatar} />
          <Title className="text-center">{this.state.forum.title}</Title>
          <SubTitle className="text-center">
            {this.state.forum.shortDescription}
          </SubTitle>
          <InfoBlock title={this.state.forum.description}>
            {this.state.forum.rule}
          </InfoBlock>

          <div className="comments">
            {this.state.comments.map((c) => (
              <CommentComponent key={c.id} {...c} />
            ))}
          </div>
          {!this.state.forum.comment && this.context.user.id !== -1 && (
            <CommentForm
              onCommentUpdate={this.updateComment}
              onSendComment={this.handleSendComment}
            />
          )}
          <About
            author={this.state.forum.userNickname}
            coauthors={this.state.forum.coauthors}
            createdAt={this.state.forum.createdAt}
            updatedAt={this.state.forum.updatedAt}
          />
        </div>
      </Page>
    )
  }
}

export default ForumPage
