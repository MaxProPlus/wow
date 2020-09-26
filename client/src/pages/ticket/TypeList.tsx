import React, {Component} from "react"
import {TicketType} from "../../../../server/src/common/entity/types"
import Spinner from "../../components/spinner/Spinner"
import icon from "./img/ticket.svg"
import PageTitle from "../../components/pageTitle/PageTitle"
import AlertDanger from "../../components/alert-danger/AlertDanger"
import styles from "../../css/listTitle.module.scss"
import BlockReport from "../../components/list/BlockReport"
import TicketApi from "../../api/TicketApi"
import UserContext from "../../utils/userContext"
import {Redirect, RouteComponentProps} from "react-router-dom"
import ButtonIcon from "../../components/list/ButtonIcon"
import penIcon from "../../img/pen.svg"

type P = RouteComponentProps

type S = {
    isLoaded: boolean,
    errorMessage: string,
    list: TicketType[],
}

class TicketTypeList extends Component<P, S> {
    static contextType = UserContext
    private ticketApi = new TicketApi()

    constructor(props: P) {
        super(props)
        this.state = {
            isLoaded: false,
            errorMessage: '',
            list: [],
        }
    }

    componentDidMount() {
        this.updateData()
    }

    updateData = () => {
        this.ticketApi.getTicketsTypeList().then(r => {
            this.setState({
                list: r,
            })
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

    render() {
        if (!!this.state.errorMessage) {
            return (<AlertDanger>{this.state.errorMessage}</AlertDanger>)
        }
        return (
            <>
                {!this.state.isLoaded && <Spinner/>}
                {this.context.user.id === -1 &&
                <Redirect to={{pathname: "/login", state: {from: this.props.location}}}/>}
                <PageTitle title="Тикеты" icon={icon} className={styles.header}>
                    <ButtonIcon href="/help/ticket/create" icon={penIcon}>Новый запрос</ButtonIcon>
                </PageTitle>
                {this.state.list.length > 0 ?
                    this.state.list.map(el =>
                        (<BlockReport key={el.id} id={el.id} title={el.title} muteTitle={el.description}
                                      urlAvatar={el.urlIcon} href="/help/ticket/type/"/>)
                    )
                    :
                    'Нет категорий'}
            </>
        )
    }
}

export default TicketTypeList