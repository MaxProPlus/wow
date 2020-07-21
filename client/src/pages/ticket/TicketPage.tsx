import React from "react"
import Spinner from "../../components/spinner/Spinner"
import TicketApi from "../../api/ticketApi";
import {Comment, Ticket, TicketStatus, ticketStatusToString} from "../../../../server/src/common/entity/types";
import history from "../../utils/history";
import './TicketPage.scss'
import CommentForm from "./commentFrom/CommentForm";
import CommentC from "./comment/Comment";
import Button from "../../components/button/Button";
import AlertDanger from "../../components/alert-danger/AlertDanger";
import UserContext from "../../utils/userContext";

type IState = {
    isLoaded: boolean
    errorMessage: string
    id: string
    ticket: Ticket,
    comments: Comment[]
}

class TicketPage extends React.Component<{}, IState> {

    private ticketApi = new TicketApi()
    static contextType = UserContext;

    constructor(props: any) {
        super(props)
        this.state = {
            isLoaded: false,
            errorMessage: '',
            id: props.match.params.id,
            ticket: new Ticket(),
            comments: [],
        }
    }

    static getDerivedStateFromProps(nextProps: any, prevState: IState) {
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

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<IState>) {
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
        this.ticketApi.getTicket(this.state.id).then(r => {
            console.log(r)
            if (r.status !== 'OK') {
                console.error(r.errorMessage)
                this.setState({
                    errorMessage: r.errorMessage,
                })
                // history.push('/')
                return
            }
            this.setState({
                ticket: r.results[0],
                comments: r.results[1],
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
        this.ticketApi.getComments(this.state.id).then(r => {
            if (r.status !== 'OK') {
                this.setState({
                    errorMessage: r.errorMessage,
                })
                return
            }
            this.setState({
                comments: r.results,
            })
        }).finally(() => {
            this.setState({
                isLoaded: true,
            })
        })

    }

    changeStatus = (status: TicketStatus) => {
        this.setState({
            isLoaded: false,
        })
        this.ticketApi.changeStatus(this.state.id, status).then(r => {
            if (r.status !== 'OK') {
                console.error(r.errorMessage)
                return
            }
            this.updateData()
        })
    }


    render() {
        console.log(this.context)
        return (
            <div>
                {!this.state.isLoaded && <Spinner/>}
                <div className="page-ticket">
                    {this.state.errorMessage && <AlertDanger>{this.state.errorMessage}</AlertDanger>}
                    <div className="ticket">
                        <div className="title">{this.state.ticket.title}</div>
                        <div className="description">{this.state.ticket.text}</div>
                        <div className="status">Автор: <span
                            className="author_title">{this.state.ticket.userNickname}</span> Статус
                            заявки: {ticketStatusToString(this.state.ticket.status)}</div>
                        {this.context.user.rights.includes('TICKET_UPDATE_STATUS') &&
                        <div className="change-status"><Button onClick={() => {
                            this.changeStatus(TicketStatus.START)
                        }}>Открыть</Button> <Button onClick={() => {
                            this.changeStatus(TicketStatus.PROGRESS)
                        }}>Взять в работу</Button> <Button onClick={() => {
                            this.changeStatus(TicketStatus.CLOSE)
                        }}>Закрыть</Button></div>
                        }

                    </div>
                    <div className="comments">
                        {this.state.comments.map((c: any) => <CommentC key={c.id}
                                                                       {...c}/>)}
                    </div>
                    {(this.state.ticket.status !== TicketStatus.CLOSE && !this.state.errorMessage) &&
                    <CommentForm onCommentUpdate={this.updateComment}
                                 idTicket={this.state.ticket.id}/>}
                </div>
            </div>
        )
    }
}

export default TicketPage