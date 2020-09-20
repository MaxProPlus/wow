import React, {ChangeEvent, Component} from "react"
import {Forum} from "../../../../server/src/common/entity/types"
import {Col, Row} from "react-bootstrap"
import Button from "../../components/button/Button"
import Spinner from "../../components/spinner/Spinner"
import icon from "./img/forum.svg"
import PageTitle from "../../components/pageTitle/PageTitle"
import Search from "../../components/list/Search"
import AlertDanger from "../../components/alert-danger/AlertDanger"
import styles from "../../css/listTitle.module.scss"
import SearchBlock from "../../components/list/SearchBlock"
import Form from "../../components/form/Form"
import InputField from "../../components/form/inputField/InputField"
import BlockReport from "../../components/list/BlockReport"
import ForumApi from "../../api/ForumApi"

type S = {
    isLoaded: boolean,
    errorMessage: string,
    count: number,
    list: Forum[],
    title: string
    filterShow: boolean
}


class ForumList extends Component<any, S> {
    private forumApi = new ForumApi()
    private page = 1
    private limit = 10

    constructor(props: any) {
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
        this.forumApi.getAll(data, this.limit, this.page).then(r => {
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

    toggle = () => {
        this.setState((state) => {
            return {
                filterShow: !state.filterShow
            }
        })

    }

    handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        this.setState({
            errorMessage: '',
            [e.target.id]: e.target.value
        } as any)
    }

    handleChangeSelect = (e: ChangeEvent<HTMLSelectElement>) => {
        this.setState({
            [e.target.id]: Number(e.target.value)
        } as any)
    }

    handleSubmit = (e: any) => {
        e.preventDefault()
        this.page = 1
        this.setState({
            isLoaded: false
        })
        this.updateData(true)
    }


    render() {
        if (!!this.state.errorMessage) {
            return (<AlertDanger>{this.state.errorMessage}</AlertDanger>)
        }
        const more = this.limit * this.page < this.state.count ?
            <Button onClick={this.handlePageClick} className="more-btn">Загрузить еще</Button> : ''
        return (
            <div className="character-list">
                {!this.state.isLoaded && <Spinner/>}
                <PageTitle title="Последние обсуждения" icon={icon} className={styles.header}>
                    <Search href="/material/forum/create" id="title" text="Создать обсуждение"
                            placeholder="Поиск обсуждений"
                            value={this.state.title} toggle={this.toggle} onChange={this.handleChange}
                            onSubmit={this.handleSubmit}/>
                </PageTitle>
                <SearchBlock show={this.state.filterShow} onSubmit={this.handleSubmit}>
                    <Row>
                        <Col md={6}>
                            <Form.Group>
                                <InputField id="title" label="Название обсуждения" type="text"
                                            placeholder="Введите название обсуждения"
                                            value={this.state.title}
                                            onChange={this.handleChange}/>
                                {/*<Row>*/}
                                {/*    <Col md={6}>*/}
                                {/*        <InputField id="race" label="Раса" type="text"*/}
                                {/*                    placeholder="Введите расу персонажа"*/}
                                {/*                    value={this.state.race}*/}
                                {/*                    onChange={this.handleChange}/>*/}
                                {/*    </Col>*/}
                                {/*    <Col md={6}>*/}
                                {/*        <Select label="Пол" id="sex" value={this.state.sex}*/}
                                {/*                onChange={this.handleChangeSelect}>*/}
                                {/*            {[-1, 0, 1, 2].map(v =>*/}
                                {/*                (<option key={v} value={v}>{sexToString(v)}</option>)*/}
                                {/*            )}*/}
                                {/*        </Select>*/}
                                {/*    </Col>*/}
                                {/*</Row>*/}
                            </Form.Group>
                        </Col>
                        {/*<Col md={6}>*/}
                        {/*    <InputField label="Игровое имя" type="text" placeholder="Введите игровое имя персонажа"*/}
                        {/*                value={this.state.nickname}*/}
                        {/*                id="nickname" onChange={this.handleChange}/>*/}
                        {/*    <Row>*/}
                        {/*        <Col md={6}>*/}
                        {/*            <Select label="Активность" id="active" value={this.state.active}*/}
                        {/*                    onChange={this.handleChangeSelect}>*/}
                        {/*                {[-1, 0, 1, 2, 3].map(v =>*/}
                        {/*                    (<option key={v} value={v}>{characterActiveToString(v)}</option>)*/}
                        {/*                )}*/}
                        {/*            </Select>*/}
                        {/*        </Col>*/}
                        <Col md={6} className="d-flex align-items-end">
                            <Button block className="mb-3">Найти</Button>
                        </Col>
                        {/*    </Row>*/}
                        {/*</Col>*/}
                    </Row>
                </SearchBlock>
                {this.state.list.length > 0 ?
                    this.state.list.map(el =>
                        (<BlockReport key={el.id} id={el.id} title={el.title} muteTitle=""
                                      urlAvatar={el.urlAvatar} href="/material/forum/"/>)
                    )
                    :
                    'Форумы не найдены'}
                {more}
            </div>
        )
    }
}

export default ForumList