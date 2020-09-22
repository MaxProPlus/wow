import React, {Component} from "react"
import {Ticket, ticketStatusToString} from "../../../../server/src/common/entity/types"
import Button from "../../components/button/Button"
import Spinner from "../../components/spinner/Spinner"
import icon from "./img/ticket.svg"
import PageTitle from "../../components/pageTitle/PageTitle"
import AlertDanger from "../../components/alert-danger/AlertDanger"
import styles from "../../css/listTitle.module.scss"
import BlockReport from "../../components/list/BlockReport"
import TicketApi from "../../api/TicketApi"
import history from "../../utils/history"
import penIcon from "../../img/pen.svg"
import urlTicket from "./img/urlTicket.svg"
import ButtonIcon from "../../components/list/ButtonIcon"

type S = {
    id: string,
    isLoaded: boolean,
    errorMessage: string,
    count: number,
    list: Ticket[],
}


class TicketList extends Component<any, S> {
    private ticketApi = new TicketApi()
    private page = 1
    private limit = 10

    constructor(props: any) {
        super(props)
        this.state = {
            id: props.match.params.id,
            isLoaded: false,
            errorMessage: '',
            count: 0,
            list: [],
        }
    }

    static getDerivedStateFromProps(nextProps: any, prevState: S) {
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

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<S>) {
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
        this.ticketApi.getTicketsByType(this.state.id, this.limit, this.page).then(r => {
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
        }, (err) => {
            this.setState({
                errorMessage: err
            })
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
        this.updateData(false)
    }

    render() {
        if (!!this.state.errorMessage) {
            return (<AlertDanger>{this.state.errorMessage}</AlertDanger>)
        }
        const more = this.limit * this.page < this.state.count ?
            <Button onClick={this.handlePageClick} className="more-btn">Загрузить еще</Button> : ''
        return (
            <>
                {!this.state.isLoaded && <Spinner/>}
                <PageTitle title="Тикеты" icon={icon} className={styles.header}>
                    <ButtonIcon href="/help/ticket/create" icon={penIcon}>Новый запрос</ButtonIcon>
                </PageTitle>
                {this.state.list.length > 0 ?
                    this.state.list.map(el =>
                        (<BlockReport key={el.id} id={el.id} title={ticketStatusToString(el.status) + " | " + el.title}
                                      muteTitle={el.text}
                                      urlAvatar={urlTicket} href="/help/ticket/"/>)
                    )
                    :
                    'Заявки не найдены'}
                {more}
            </>
        )
    }
}

export default TicketList