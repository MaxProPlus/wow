import React from 'react'
import Spinner from '../../../components/spinner/Spinner'
import Button from '../../../components/button/Button'
import InputField from '../../../components/form/inputField/InputField'
import AlertDanger from '../../../components/alertDanger/AlertDanger'
import TicketApi from '../../../api/TicketApi'
import {Ticket, TicketType} from '../../../../../server/src/common/entity/types'
import Validator from '../../../../../server/src/common/validator'
import history from '../../../utils/history'
import UserContext from '../../../contexts/userContext'
import {Redirect, RouteComponentProps} from 'react-router-dom'
import Form from '../../../components/form/Form'
import Select from '../../../components/form/select/Select'
import Textarea from '../../../components/form/textarea/Textarea'
import {RouteProps} from '../../../types/RouteProps'
import Page from '../../../components/page/Page'

type P = RouteComponentProps & RouteProps

type S = {
  isLoaded: boolean
  title: string
  idTicketType: number
  listType: TicketType[]
  text: string
  error: string
}

class Create extends React.Component<P, S> {
  static contextType = UserContext
  private ticketApi = new TicketApi()
  private validator = new Validator()

  constructor(props: P) {
    super(props)
    this.state = {
      isLoaded: false,
      title: '',
      idTicketType: 0,
      listType: [],
      text: '',
      error: '',
    }
  }

  componentDidMount() {
    this.updateData()
  }

  updateData = () => {
    this.ticketApi
      .getTicketsTypeList()
      .then(
        (r) => {
          this.setState({
            listType: r,
            idTicketType: r[0].id,
          })
        },
        (err) => {
          this.setState({
            error: err,
          })
        }
      )
      .finally(() => {
        this.setState({
          isLoaded: true,
        })
      })
  }

  handleChangeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({
      idTicketType: Number(e.target.value),
    } as S)
  }

  handleChange = (e: any) => {
    this.setState({
      [e.target.id]: e.target.value,
    } as {[K in keyof S]: S[K]})
  }

  handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    this.setState({
      error: '',
      isLoaded: false,
    })
    let ticket = new Ticket()
    ticket.title = this.state.title
    ticket.text = this.state.text
    ticket.idTicketType = this.state.idTicketType
    const err = this.validator.validateTicket(ticket)
    if (err) {
      this.props.scrollTop()
      this.setState({
        error: err,
        isLoaded: true,
      })
      return
    }
    this.ticketApi
      .create(ticket)
      .then(
        (r) => {
          history.push('/help/ticket/' + r)
        },
        (err) => {
          this.props.scrollTop()
          this.setState({
            error: err,
          })
        }
      )
      .finally(() => {
        this.setState({
          isLoaded: true,
        })
      })
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
        <div className="page-ticket-create">
          <Form onSubmit={this.handleSubmit}>
            <AlertDanger>{this.state.error}</AlertDanger>
            <div className="title">Создание заявки</div>
            <InputField
              label="Название"
              type="text"
              value={this.state.title}
              id="title"
              onChange={this.handleChange}
            />
            <Select
              label="Тип"
              id="type"
              value={this.state.idTicketType}
              onChange={this.handleChangeSelect}
            >
              {this.state.listType.map((tt) => (
                <option key={tt.id} value={tt.id}>
                  {tt.title}
                </option>
              ))}
            </Select>
            <Textarea
              label="Текст заявки"
              id="text"
              value={this.state.text}
              onChange={this.handleChange}
              rows={10}
            />
            <Form.Group>
              <Button>Создать</Button>
            </Form.Group>
          </Form>
        </div>
      </Page>
    )
  }
}

export default Create
