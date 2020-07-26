import React from "react"
import Spinner from "../../components/spinner/Spinner"
import Button from "../../components/button/Button";
import {Link} from "react-router-dom";
import TicketApi from "../../api/ticketApi";
import {TicketType} from "../../../../server/src/common/entity/types";
import './TypesOfTicket.scss'

type IState = {
    isLoaded: boolean
    list: TicketType[]
}

class TypesOfTicket extends React.Component<{}, IState> {

    private ticketApi = new TicketApi()

    constructor(props: {}) {
        super(props)
        this.state = {
            isLoaded: false,
            list: [],
        }
    }

    componentDidMount() {
        this.updateData()
    }

    updateData = () => {
        this.ticketApi.getTicketsTypeList().then(r => {
            if (r.status !== 'OK') {
                console.error(r)
                return
            }
            this.setState({
                list: r.results
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

                <div className="page-ticket-type-list">
                    <Button><Link to="/ticket/create">Создать новый запрос</Link></Button><br/>
                    <ul>
                        {this.state.list.map((tt) =>
                            (<li key={tt.id}><Link to={"/ticket/type/" + tt.id}>
                                <div className="title">{tt.title}</div>
                                <div className="description">{tt.description}</div>
                            </Link></li>)
                        )}
                    </ul>
                </div>
            </div>
        )
    }
}

export default TypesOfTicket