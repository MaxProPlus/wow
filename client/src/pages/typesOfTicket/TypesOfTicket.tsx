import React from "react"
import Spinner from "../../components/spinner/Spinner"
import Button from "../../components/button/Button"
import {Link, Redirect} from "react-router-dom"
import TicketApi from "../../api/ticketApi"
import {TicketType} from "../../../../server/src/common/entity/types"
import './TypesOfTicket.scss'
import UserContext from "../../utils/userContext"

type S = {
    isLoaded: boolean
    list: TicketType[]
}

class TypesOfTicket extends React.Component<any, S> {
    static contextType = UserContext

    private ticketApi = new TicketApi()

    constructor(props: any) {
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
            this.setState({
                list: r
            })
        }, err => {
            console.error(err)
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
                {this.context.user.id === -1 &&
                <Redirect to={{pathname: "/login", state: {from: this.props.location}}}/>}
                <div className="page-ticket-type-list">
                    <Button><Link to="/help/ticket/create">Создать новый запрос</Link></Button><br/>
                    <ul>
                        {this.state.list.map((tt) =>
                            (<li key={tt.id}><Link to={"/help/ticket/type/" + tt.id}>
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