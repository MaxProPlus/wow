import React, {ChangeEvent, Component} from "react"
import {Story} from "../../../../server/src/common/entity/types"
import Button from "../../components/button/Button"
import {Col, Row} from "react-bootstrap"
import styles from "../../css/listTitle.module.scss"
import icon from "./img/icon.svg"
import StoryApi from "../../api/StoryApi"
import Spinner from "../../components/spinner/Spinner"
import PageTitle from "../../components/pageTitle/PageTitle"
import Search from "../../components/list/Search"
import AlertDanger from "../../components/alert-danger/AlertDanger"
import Block from "../../components/list/Block"
import SearchBlock from "../../components/list/SearchBlock"
import Form from "../../components/form/Form"
import InputField from "../../components/form/inputField/InputField"

type S = {
    isLoaded: boolean,
    filterShow: boolean,
    errorMessage: string,
    count: number,
    list: Story[],
    title: string,
}

class StoryList extends Component<any, S> {
    private storyApi = new StoryApi()
    private page = 1
    private limit = 10
    private data: any

    constructor(props: any) {
        super(props)
        this.state = {
            isLoaded: false,
            filterShow: false,
            errorMessage: '',
            count: 0,
            list: [],
            title: '',
        }
    }

    componentDidMount() {
        this.updateData(true)
    }


    updateData = (reset: boolean) => {
        this.storyApi.getAll(this.limit, this.page, this.data).then(r => {
            if (reset) {
                this.setState({
                    list: r.data,
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

    handleSubmit = (e: any) => {
        e.preventDefault()
        const data: any = {}
        if (this.state.filterShow) {
            if (!!this.state.title) {
                data.title = this.state.title
            }
        } else {
            data.title = this.state.title
        }
        this.data = data
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
            <Button onClick={this.handlePageClick} className="more-btn">Загрузить еще</Button> : undefined
        return (
            <div>
                {!this.state.isLoaded && <Spinner/>}
                <PageTitle className={styles.header} title="Сюжеты" icon={icon}>
                    <Search href="/material/story/create" id="title" text="Создать сюжет" placeholder="Поиск сюжета"
                            value={this.state.title} toggle={this.toggle} onChange={this.handleChange}
                            onSubmit={this.handleSubmit}/>
                </PageTitle>
                <SearchBlock show={this.state.filterShow} onSubmit={this.handleSubmit}>
                    <Row>
                        <Col md={6}>
                            <Form.Group>
                                <InputField id="title" label="Название сюжета" type="text"
                                            placeholder="Введите название"
                                            value={this.state.title}
                                            onChange={this.handleChange}/>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Row className="h-100">
                                <Col md={6}>
                                </Col>
                                <Col md={6} className="d-flex align-items-end">
                                    <Button block="true" className="mb-3">Найти</Button>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </SearchBlock>
                {this.state.list.length > 0 ?
                    <Row>
                        {this.state.list.map(el =>
                            (<Block key={el.id} id={el.id} title={el.title} muteTitle={el.shortDescription}
                                    urlAvatar={el.urlAvatar} href="/material/story/" size={4}/>)
                        )}
                    </Row>
                    :
                    'Сюжеты не найдены'}
                {more}
            </div>
        )
    }
}

export default StoryList