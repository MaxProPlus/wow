import React, {Component} from 'react'
import Button from '../../../components/button/Button'
import Spinner from '../../../components/spinner/Spinner'
import AlertDanger from '../../../components/alert-danger/AlertDanger'
import BlockReport from '../../../components/list/BlockReport'
import {RouteComponentProps} from 'react-router-dom'
import Page from '../../../components/page/Page'
import MaterialApi from '../../../api/MaterialApi'

type P = RouteComponentProps

type S = {
    isLoaded: boolean,
    errorMessage: string,
    count: number,
    list: any[],
    title: string
}

class SearchPage extends Component<P, S> {
    private materialApi = new MaterialApi()
    private page = 1
    private limit = 10

    constructor(props: P) {
        super(props)
        let title = (new URLSearchParams(window.location.search)).get('title')
        this.state = {
            isLoaded: false,
            errorMessage: '',
            count: 0,
            list: [],
            title: title || '',
        }
    }

    static getDerivedStateFromProps(props: P, state: S) {
        if ((new URLSearchParams(window.location.search)).get('title') !== state.title) {
            return {
                title: (new URLSearchParams(window.location.search)).get('title'),
            }
        }

        return null
    }

    componentDidMount() {
        this.updateData(false)
    }

    componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>) {
        let title = (new URLSearchParams(window.location.search)).get('title')
        if (prevState.title !== title) {
            this.setState({
                title: title || '',
                isLoaded: false,
            })
            this.page = 1
            this.updateData(true)
        }
    }

    updateData = (reset: boolean) => {
        const data: any = {}
        if (!!this.state.title) {
            data.title = this.state.title
        }
        this.materialApi.getAll(this.limit, this.page, data).then(r => {
            if (reset) {
                this.setState({
                    list: r.data,
                    count: r.count,
                    isLoaded: true,
                })
            } else {
                this.setState((prevState: S) => {
                    return {
                        list: prevState.list.concat(r.data),
                        count: r.count,
                        isLoaded: true,
                    }
                })
            }
        }, (err) => {
            this.setState({
                errorMessage: err,
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
            return (<Page><AlertDanger>{this.state.errorMessage}</AlertDanger></Page>)
        }
        const more = this.limit * this.page < this.state.count ?
            <Button onClick={this.handlePageClick} className="more-btn">Загрузить еще</Button> : ''
        return (
            <Page>
                {!this.state.isLoaded && <Spinner/>}
                {/*<PageTitle title="Последние обсуждения" icon={icon} className={styles.header}></PageTitle>*/}
                {this.state.list.length > 0 && this.state.title ?
                    this.state.list.map(el =>
                        (<BlockReport key={el.id} id={el.id} title={el.title} muteTitle=""
                                      urlAvatar={el.urlAvatar} href={`/material/${el.href}/`}/>),
                    )
                    :
                    'Ничего не найдено'}
                {more}
            </Page>
        )
    }
}

export default SearchPage