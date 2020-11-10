import React, {ChangeEvent, Component} from 'react'
import {Report} from '../../../../../server/src/common/entity/types'
import {Col, Row} from 'react-bootstrap'
import Button from '../../../components/button/Button'
import Spinner from '../../../components/spinner/Spinner'
import icon from './img/report.svg'
import PageTitle from '../../../components/pageTitle/PageTitle'
import SearchBlock from '../../../components/list/SearchBlock'
import AlertDanger from '../../../components/alert-danger/AlertDanger'
import styles from '../../../css/listTitle.module.scss'
import SearchFilter from '../../../components/list/SearchFilter'
import Form from '../../../components/form/Form'
import InputField from '../../../components/form/inputField/InputField'
import BlockReport from '../../../components/list/BlockReport'
import ReportApi from '../../../api/ReportApi'
import {RouteComponentProps} from 'react-router-dom'
import Page from '../../../components/page/Page'

type P = RouteComponentProps

type S = {
    isLoaded: boolean,
    errorMessage: string,
    count: number,
    list: Report[],
    title: string
    filterShow: boolean
}

class ReportList extends Component<P, S> {
    private reportApi = new ReportApi()
    private page = 1
    private limit = 10

    constructor(props: P) {
        super(props)
        this.state = {
            isLoaded: false,
            errorMessage: '',
            count: 0,
            list: [],
            title: '',
            filterShow: false,
        }
    }

    componentDidMount() {
        this.updateData(false)
    }

    updateData = (reset: boolean) => {
        const data: any = {}
        if (!!this.state.title) {
            data.title = this.state.title
        }
        if (this.state.filterShow) {
        }
        this.reportApi.getAll(data, this.limit, this.page).then(r => {
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
                errorMessage: err,
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

    toggle = () => {
        this.setState((state) => {
            return {
                filterShow: !state.filterShow,
            }
        })
    }

    handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        this.setState({
            errorMessage: '',
            [e.target.id]: e.target.value,
        } as any)
    }

    handleChangeSelect = (e: ChangeEvent<HTMLSelectElement>) => {
        this.setState({
            [e.target.id]: Number(e.target.value),
        } as any)
    }

    handleSubmit = (e: any) => {
        e.preventDefault()
        this.page = 1
        this.setState({
            isLoaded: false,
        })
        this.updateData(true)
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
                <PageTitle title="Отчеты и логи" icon={icon} className={styles.header}>
                    <SearchBlock href="/material/report/create" id="title" text="Создать лог / отчет"
                                 placeholder="Поиск логов и отчетов"
                                 value={this.state.title} toggle={this.toggle} onChange={this.handleChange}
                                 onSubmit={this.handleSubmit}/>
                </PageTitle>
                <SearchFilter show={this.state.filterShow} onSubmit={this.handleSubmit}>
                    <Row>
                        <Col md={6}>
                            <Form.Group>
                                <InputField id="title" label="Имя лога / отчета" type="text"
                                            placeholder="Введите имя лога / отчета"
                                            value={this.state.title}
                                            onChange={this.handleChange}/>
                            </Form.Group>
                        </Col>
                        <Col md={6} className="d-flex align-items-end">
                            <Button block className="mb-3">Найти</Button>
                        </Col>
                    </Row>
                </SearchFilter>
                {this.state.list.length > 0 ?
                    this.state.list.map(el =>
                        (<BlockReport key={el.id} id={el.id} title={el.title} muteTitle=""
                                      urlAvatar={el.urlAvatar} href="/material/report/"/>),
                    )
                    :
                    'Отчеты и логи не найдены'}
                {more}
            </Page>
        )
    }
}

export default ReportList