import React from "react"
import Spinner from "../../components/spinner/Spinner"
import {Link} from "react-router-dom";
import history from "../../utils/history";
import TicketApi from "../../api/ticketApi";
import {Ticket, ticketStatusToString, TicketType} from "../../../../server/src/common/entity/types";
import './TicketsByType.scss'

type IState = {
    isLoaded: boolean
    id: string
    ticketType: TicketType
    list: Ticket[]
}

class TicketsByType extends React.Component<{}, IState> {

    private ticketApi = new TicketApi()

    constructor(props: any) {
        super(props)
        this.state = {
            isLoaded: false,
            id: props.match.params.id,
            ticketType: new TicketType(),
            list: [],
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
        this.ticketApi.getTicketsByType(this.state.id).then(r => {
            if (r.status !== 'OK') {
                console.error(r.errorMessage)
                return
            }
            this.setState({
                ticketType: r.results[0],
                list: r.results[1],
            })
        }).finally(() => {
            this.setState({
                isLoaded: true,
            })
        })

    }

    render() {
        return (
            <div>
                {!this.state.isLoaded && <Spinner/>}
                <div className="page-ticket-list">
                    <ul>
                        <h2>{this.state.ticketType.title}</h2>
                        {this.state.list.length > 0 ? this.state.list.map((t) =>
                            <li key={t.id}><Link to={"/ticket/" + t.id}>
                                <div className="title">{t.title}</div>
                                <div className="description">Статус: {ticketStatusToString(t.status)}</div>
                            </Link></li>
                        ): <h3 className="not-found">Нет заявок</h3>}
                    </ul>
                </div>
            </div>
        )
    }
}

export default TicketsByType