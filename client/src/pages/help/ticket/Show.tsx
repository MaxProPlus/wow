import React from 'react'
import Spinner from '../../../components/spinner/Spinner'
import TicketApi from '../../../api/TicketApi'
import {
  CommentTicket,
  Ticket,
  TicketStatus,
  ticketStatusToString,
} from '../../../../../server/src/common/entity/types'
import history from '../../../utils/history'
import {Redirect, RouteComponentProps} from 'react-router-dom'
import Page from '../../../components/page/Page'
import AlertDanger from '../../../components/alertDanger/AlertDanger'
import Select from '../../../components/form/select/Select'
import CommentForm from '../../../components/commentFrom/CommentForm'
import {MatchId} from '../../../types/RouteProps'
import UserContext from '../../../contexts/userContext'
import CommentComponent from '../../../components/comment/Comment'
import {Rights} from '../../../../../server/src/providers/right'
import './Show.scss'

type P = RouteComponentProps<MatchId>

type S = {
  status: number
  isLoaded: boolean
  errorMessage: string
  id: string
  ticket: Ticket
  comments: CommentTicket[]
}

class TicketPage extends React.Component<P, S> {
  static contextType = UserContext
  private ticketApi = new TicketApi()

  constructor(props: P) {
    super(props)
    this.state = {
      status: 0,
      isLoaded: false,
      errorMessage: '',
      id: props.match.params.id,
      ticket: new Ticket(),
      comments: [],
    }
  }

  static getDerivedStateFromProps(nextProps: Readonly<P>, prevState: S) {
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

  componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>) {
    if (prevProps.match.params.id !== this.state.id) {
      this.updateData()
    }
  }

  componentDidMount() {
    this.updateData()
  }

  updateData = () => {
    this.setState({
      isLoaded: false,
    })
    this.ticketApi
      .getTicket(this.state.id)
      .then(
        (r) => {
          this.setState({
            ticket: r[0],
            comments: r[1],
            status: r[0].status,
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
    this.ticketApi
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

  handleSendComment = (comment: CommentTicket) => {
    comment.idTicket = this.state.ticket.id
    return this.ticketApi.addComment(comment)
  }

  handleStatus = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = parseInt(e.target.value)
    this.setState({
      isLoaded: false,
      status: status,
    })
    this.ticketApi.changeStatus(this.state.id, status).then(
      () => {
        this.updateData()
      },
      (err) => {
        console.error(err)
      }
    )
  }

  render() {
    return (
      <Page>
        {!this.state.isLoaded && <Spinner />}
        {this.context.user.id === -1 && (
          <Redirect
            to={{pathname: '/login', state: {from: this.props.location}}}
          />
        )}
        <div className="page-ticket">
          <AlertDanger>{this.state.errorMessage}</AlertDanger>
          <div className="ticket">
            <div className="title">{this.state.ticket.title}</div>
            <div className="description">{this.state.ticket.text}</div>
            <div className="status">
              Автор:{' '}
              <span className="author_title">
                {this.state.ticket.userNickname}
              </span>{' '}
              Статус заявки: {ticketStatusToString(this.state.ticket.status)}
            </div>
            {this.context.user.rights.includes(Rights.TICKET_MODERATOR) && (
              <Select
                label="Статус заявки:"
                value={this.state.status}
                onChange={this.handleStatus}
              >
                {[0, 1, 9].map((v) => (
                  <option key={v} value={v}>
                    {ticketStatusToString(v)}
                  </option>
                ))}
              </Select>
            )}
          </div>
          <div className="comments">
            {this.state.comments.map((c: CommentTicket) => (
              <CommentComponent key={c.id} {...c} />
            ))}
          </div>
          {this.state.ticket.status !== TicketStatus.CLOSE &&
            !this.state.errorMessage && (
              <CommentForm
                onCommentUpdate={this.updateComment}
                onSendComment={this.handleSendComment}
              />
            )}
        </div>
      </Page>
    )
  }
}

export default TicketPage
