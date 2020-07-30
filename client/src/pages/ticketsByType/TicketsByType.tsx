import React from "react"
import Spinner from "../../components/spinner/Spinner"
import {Link, Redirect} from "react-router-dom";
import history from "../../utils/history";
import TicketApi from "../../api/ticketApi";
import {Ticket, ticketStatusToString, TicketType} from "../../../../server/src/common/entity/types";
import './TicketsByType.scss'
import Button from "../../components/button/Button";
import UserContext from "../../utils/userContext";

type IState = {
    isLoaded: boolean
    id: string
    type: TicketType,
    count: number,
    data: Ticket[],
}

class TicketsByType extends React.Component<any, IState> {
    static contextType = UserContext
    private ticketApi = new TicketApi()
    private page = 1
    private limit = 10

    constructor(props: any) {
        super(props)
        this.state = {
            isLoaded: false,
            id: props.match.params.id,
            type: new TicketType(),
            data: [],
            count: 0,
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
            this.setState({
                isLoaded: false,
            })
            this.updateData()
        }
    }

    componentDidMount() {
        this.updateData()
    }

    updateData = () => {
        this.ticketApi.getTicketsByType(this.state.id, this.limit, this.page).then(r => {
            this.setState((prevState: IState) => {
                return {
                    type: r.type,
                    data: prevState.data.concat(r.data),
                    count: r.count,
                }
            })
        }, err => {
            console.error(err)
        }).finally(() => {
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
        this.updateData()
    }

    render() {
        const more = this.limit * this.page < this.state.count ?
            <Button onClick={this.handlePageClick} className="more-btn">Загрузить еще</Button> : ''
        const notFound = this.state.data.length > 0 ? '' : <h3 className="not-found">Нет заявок</h3>
        return (
            <div>
                {!this.state.isLoaded && <Spinner/>}
                {this.context.user.id === -1 &&
                <Redirect to={{pathname: "/login", state: {from: this.props.location}}}/>}
                <div className="page-ticket-list">
                    <ul>
                        <h2>{this.state.type.title}</h2>
                        {this.state.data.map((t) =>
                            <li key={t.id}><Link to={"/ticket/" + t.id}>
                                <div className="title">{t.title}</div>
                                <div className="description">Статус: {ticketStatusToString(t.status)}</div>
                            </Link></li>)}
                        {more}
                        {notFound}
                    </ul>
                </div>
            </div>
        )
    }
}

export default TicketsByType