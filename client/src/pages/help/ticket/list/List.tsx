import React, {Component} from 'react'
import {
  Ticket,
  ticketStatusToString,
} from '../../../../../../server/src/common/entity/types'
import Button from '../../../../components/button/Button'
import Spinner from '../../../../components/spinner/Spinner'
import icon from './img/ticket.svg'
import PageTitle from '../../../../components/pageTitle/PageTitle'
import AlertDanger from '../../../../components/alertDanger/AlertDanger'
import BlockReport from '../../../../components/list/BlockReport'
import TicketApi from '../../../../api/TicketApi'
import history from '../../../../utils/history'
import penIcon from '../../../../img/pen.svg'
import urlTicket from './img/urlTicket.svg'
import ButtonIcon from '../../../../components/list/ButtonIcon'
import {RouteComponentProps} from 'react-router-dom'
import {MatchId} from '../../../../types/RouteProps'
import Page from '../../../../components/page/Page'
import DateFormatter from '../../../../utils/date'
import './List.scss'

type P = RouteComponentProps<MatchId>

type S = {
  id: string
  isLoaded: boolean
  errorMessage: string
  count: number
  list: Ticket[]
}

class TicketList extends Component<P, S> {
  private ticketApi = new TicketApi()
  private page = 1
  private limit = 10

  constructor(props: P) {
    super(props)
    this.state = {
      id: props.match.params.id,
      isLoaded: false,
      errorMessage: '',
      count: 0,
      list: [],
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
      this.setState({
        isLoaded: false,
      })
      this.updateData(false)
    }
  }

  componentDidMount() {
    this.updateData(false)
  }

  updateData = (reset: boolean) => {
    this.ticketApi
      .getTicketsByType(this.state.id, this.limit, this.page)
      .then(
        (r) => {
          if (reset) {
            this.setState({
              list: r.data,
              count: r.count,
            })
          } else {
            this.setState((prevState: S) => {
              return {
                list: prevState.list.concat(r.data),
                count: r.count,
              }
            })
          }
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

  handlePageClick = () => {
    this.setState({
      isLoaded: false,
    })
    this.page += 1
    this.updateData(false)
  }

  render() {
    if (!!this.state.errorMessage) {
      return (
        <Page>
          <AlertDanger>{this.state.errorMessage}</AlertDanger>
        </Page>
      )
    }
    const more =
      this.limit * this.page < this.state.count ? (
        <Button onClick={this.handlePageClick} className="more-btn">
          Загрузить еще
        </Button>
      ) : (
        ''
      )
    return (
      <Page>
        {!this.state.isLoaded && <Spinner />}
        <PageTitle title="Тикеты" icon={icon} className="page-title_sm-hidden">
          <ButtonIcon href="/help/ticket/create" icon={penIcon}>
            Новый запрос
          </ButtonIcon>
        </PageTitle>
        {this.state.list.length > 0
          ? this.state.list.map((el) => (
              <BlockReport
                key={el.id}
                id={el.id}
                title={
                  <>
                    <span className={'status-' + el.status}>
                      {ticketStatusToString(el.status)} |{' '}
                    </span>
                    {el.title}
                  </>
                }
                muteTitle={el.text}
                urlAvatar={urlTicket}
                href="/help/ticket/"
                bottomText={'by ' + el.userNickname}
                bottomRightText={
                  <>
                    <span className={'status-' + el.status}>
                      {el.moderNickname ? el.moderNickname + ' | ' : ''}
                    </span>
                    <span className="text-muted">
                      {DateFormatter.withoutYear(el.createdAt)}
                    </span>
                  </>
                }
              />
            ))
          : 'Заявки не найдены'}
        {more}
      </Page>
    )
  }
}

export default TicketList
