import React, {ChangeEvent, Component} from 'react'
import CharacterApi from '../../../api/CharacterApi'
import {Character, characterActiveToString, sexToString} from '../../../../../server/src/common/entity/types'
import {Col, Row} from 'react-bootstrap'
import Button from '../../../components/button/Button'
import Spinner from '../../../components/spinner/Spinner'
import icon from './img/char.svg'
import PageTitle from '../../../components/pageTitle/PageTitle'
import SearchBlock from '../../../components/list/SearchBlock'
import AlertDanger from '../../../components/alert-danger/AlertDanger'
import styles from '../../../css/listTitle.module.scss'
import Block from '../../../components/list/Block'
import SearchFilter from '../../../components/list/SearchFilter'
import Form from '../../../components/form/Form'
import InputField from '../../../components/form/inputField/InputField'
import Select from '../../../components/form/select/Select'
import {RouteComponentProps} from 'react-router-dom'
import Page from '../../../components/page/Page'

type P = RouteComponentProps

type S = {
    isLoaded: boolean,
    errorMessage: string,
    count: number,
    list: Character[],
    title: string
    nickname: string
    race: string
    sex: number
    active: number
    filterShow: boolean
}

class CharacterList extends Component<P, S> {
    private characterApi = new CharacterApi()
    private page = 1
    private limit = 10
    private data: any

    constructor(props: P) {
        super(props)
        this.state = {
            isLoaded: false,
            errorMessage: '',
            count: 0,
            list: [],
            title: '',
            nickname: '',
            race: '',
            sex: -1,
            active: -1,
            filterShow: false,
        }
    }

    componentDidMount() {
        this.updateData(false)
    }

    updateData = (reset: boolean) => {
        this.characterApi.getAll(this.limit, this.page, this.data).then(r => {
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
        const data: any = {}
        if (this.state.filterShow) {
            if (!!this.state.title) {
                data.title = this.state.title
            }
            if (!!this.state.nickname) {
                data.nickname = this.state.nickname
            }
            if (!!this.state.race) {
                data.race = this.state.race
            }
            if (this.state.sex !== -1) {
                data.sex = this.state.sex
            }
            if (this.state.active !== -1) {
                data.active = this.state.active
            }
        } else {
            data.title = this.state.title
        }
        this.data = data
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
                <PageTitle title="Персонажи" icon={icon} className={styles.header}>
                    <SearchBlock href="/material/character/create" id="title" text="Создать персонажа"
                                 placeholder="Поиск персонажа"
                                 value={this.state.title} toggle={this.toggle} onChange={this.handleChange}
                                 onSubmit={this.handleSubmit}/>
                </PageTitle>
                <SearchFilter show={this.state.filterShow} onSubmit={this.handleSubmit}>
                    <Row>
                        <Col md={6}>
                            <Form.Group>
                                <InputField id="title" label="Полное имя" type="text"
                                            placeholder="Введите полное имя персонажа"
                                            value={this.state.title}
                                            onChange={this.handleChange}/>
                                <Row>
                                    <Col md={6}>
                                        <InputField id="race" label="Раса" type="text"
                                                    placeholder="Введите расу персонажа"
                                                    value={this.state.race}
                                                    onChange={this.handleChange}/>
                                    </Col>
                                    <Col md={6}>
                                        <Select label="Пол" id="sex" value={this.state.sex}
                                                onChange={this.handleChangeSelect}>
                                            {[-1, 0, 1, 2].map(v =>
                                                (<option key={v} value={v}>{sexToString(v)}</option>),
                                            )}
                                        </Select>
                                    </Col>
                                </Row>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <InputField label="Игровое имя" type="text" placeholder="Введите игровое имя персонажа"
                                        value={this.state.nickname}
                                        id="nickname" onChange={this.handleChange}/>
                            <Row>
                                <Col md={6}>
                                    <Select label="Активность" id="active" value={this.state.active}
                                            onChange={this.handleChangeSelect}>
                                        {[-1, 0, 1, 2, 3].map(v =>
                                            (<option key={v} value={v}>{characterActiveToString(v)}</option>),
                                        )}
                                    </Select>
                                </Col>
                                <Col md={6} className="d-flex align-items-end">
                                    <Button block="true" className="mb-3">Найти</Button>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </SearchFilter>
                {this.state.list.length > 0 ?
                    <Row>
                        {this.state.list.map(el =>
                            (<Block key={el.id} id={el.id} textTop={el.userNickname} title={el.title} textBottom={el.shortDescription}
                                    urlAvatar={el.urlAvatar} href="/material/character/" size={3}/>),
                        )}
                    </Row>
                    :
                    'Персонажи не найдены'}
                {more}
            </Page>
        )
    }
}

export default CharacterList