import React from "react"
import Spinner from "../../components/spinner/Spinner"
import Button from "../../components/button/Button";
import InputField from "../../components/form/input-field/InputField";
import AlertDanger from "../../components/alert-danger/AlertDanger";
import TicketApi from "../../api/ticketApi";
import { TicketType, Ticket } from "../../../../server/src/common/entity/types";
import Validator from "../../../../server/src/common/validator";
import history from "../../utils/history";

type IState = {
    isLoaded: boolean
    title: string
    idTicketType: 0
    listType: TicketType[]
    text: string
    error: string
}

class TicketCreate extends React.Component<{}, IState> {

    private ticketApi = new TicketApi()
    private validator = new Validator()
    constructor(props: {}) {
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
        this.ticketApi.getTicketsTypeList().then(r=>{
            if (r.status !== 'OK') {
                this.setState({
                    error: r.errorMessage
                })
                return
            }
            this.setState({
                listType: r.results,
                idTicketType: r.results[0].id
            })
        }).finally(()=>{
            this.setState({
                isLoaded: true,
            })
        })
    }

    handleChangeSelect = (e: any) => {
        this.setState({
            idTicketType: Number(e.target.value)
        } as IState)
    }

    handleChange = (e: any) => {
        this.setState({
            [e.target.id]: e.target.value
        } as { [K in keyof IState]: IState[K]})
    }
    handleSubmit = (e: any) => {
        e.preventDefault()
        this.setState({
            error: '',
            isLoaded: false,
        })
        let ticket = new Ticket()
        ticket.title = this.state.title
        ticket.text = this.state.text
        ticket.idTicketType = this.state.idTicketType
        const {ok, err} = this.validator.validateTicket(ticket)
        if (!ok) {
            this.setState({
                error: err,
                isLoaded: true,
            })
            return
        }
        this.ticketApi.create(ticket).then(r=>{
            if (r.status !== 'OK') {
                this.setState({
                    error: r.errorMessage
                })
                return
            }
            history.push('/ticket/'+r.results[0])
        }).finally(()=>{
            this.setState({
                isLoaded: true
            })
        })
        console.log(this.state)
    }

    render() {
        return (
            <div>
                {!this.state.isLoaded && <Spinner/>}
                <div className="page-ticket-create">
                    <form className="form-sign" onSubmit={this.handleSubmit}>
                        {this.state.error && <AlertDanger>{this.state.error}</AlertDanger>}
                        <div className="title">Создание заявки</div>
                        <InputField label="Название" type="text" value={this.state.title}
                                    id="title" onChange={this.handleChange}/>
                        <div className="form-group">
                            <label htmlFor="type">Тип</label>
                            <select id="idTicketType" onChange={this.handleChangeSelect} value={this.state.idTicketType}>
                                {this.state.listType.map(tt=>
                                    <option key={tt.id} value={tt.id}>{tt.title}</option>
                                )}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="text">Текст заявки</label>
                            <textarea id="text" onChange={this.handleChange} value={this.state.text}/>
                        </div>
                        <div className="from-group">
                            <Button>Создать</Button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }
}

export default TicketCreate