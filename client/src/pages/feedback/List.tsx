import React, {Component} from "react"
import {Feedback} from "../../../../server/src/common/entity/types"
import Spinner from "../../components/spinner/Spinner"
import icon from "./img/icon.svg"
import PageTitle from "../../components/pageTitle/PageTitle"
import AlertDanger from "../../components/alert-danger/AlertDanger"
import styles from "../../css/listTitle.module.scss"
import {RouteComponentProps} from "react-router-dom"
import FeedbackApi from "../../api/FeedbackApi"
import Block from "./Block"

type P = RouteComponentProps

type S = {
    isLoaded: boolean,
    errorMessage: string,
    list: Feedback[],
}

class FeedbackList extends Component<P, S> {
    private feedbackApi = new FeedbackApi()

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
        this.feedbackApi.getAll().then(r => {
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
                <PageTitle title="Обратная связь" icon={icon} className={styles.header}/>
                {this.state.list.length > 0 ?
                    this.state.list.map(el =>
                        (<Block key={el.id} {...el}/>)
                    )
                    :
                    'Список пуст'}
            </>
        )
    }
}

export default FeedbackList