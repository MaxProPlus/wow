import React, {ChangeEvent} from "react"
import Validator from "../../../../server/src/common/validator"
import UserContext from "../../utils/userContext"
import Spinner from "../../components/spinner/Spinner"
import {Redirect} from "react-router-dom"
import Form from "../../components/form/Form"
import AlertDanger from "../../components/alert-danger/AlertDanger"
import Button from "../../components/button/Button"
import {Guild, guildKitToString, guildStatusToString} from "../../../../server/src/common/entity/types"
import {Col, Row} from "react-bootstrap"
import InputField from "../../components/form/inputField/InputField"
import Textarea from "../../components/form/textarea/Textarea"
import Select from "../../components/form/select/Select"
import InputCheckBox from "../../components/form/inputCheckBox/InputCheckBox"
import GuildApi from "../../api/guildApi"
import history from "../../utils/history"


type S = {
    id: string
    idAccount: number
    isLoaded: boolean
    errorMessage: string
    avatar: any

    // Главное
    title: string // Название гильдии
    gameTitle: string // Название гильдии в игре
    ideology: string // Мировозрение
    shortDescription: string // Анонс

    // Основное
    description: string // Описание и история
    rule: string // Условия и правила
    articles: string // Список обсуждений/статей/логов
    members: string // Список участников
    events: string // Список событий

    // Прочее
    status: number // Статус. 0 - активна, 1 - скоро открытие, 2 - распущена
    kit: number // Набор. 0 - открыт, 1 - закрыт, 2 - временно прекращен
    style: string // CSS-стили
    coauthors: [] // Список соавторов
    closed: number // Закрыть(материал будет доступен только автору)
    hidden: number // Скрыть из общих разделов(материал будет доступен по прямой ссылкуе и для прикрепления к другим материалам)
    comment: number // Запретить комментарии
}

class GuildEdit extends React.Component<any, S> {
    static contextType = UserContext
    private guildApi = new GuildApi()
    private validator = new Validator()

    constructor(props: any) {
        super(props)
        this.state = {
            id: props.match.params.id,
            idAccount: 0,
            isLoaded: true,
            errorMessage: '',
            avatar: '',
            title: '',
            gameTitle: '',
            ideology: '',
            shortDescription: '',
            description: '',
            rule: '',
            articles: '',
            members: '',
            events: '',
            status: 0,
            kit: 0,
            style: '',
            coauthors: [],
            closed: 0,
            hidden: 0,
            comment: 0,
        }
    }

    componentDidMount() {
        this.updateData()
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<S>, snapshot?: any) {
        if (this.context.user.id > 0 && prevState.idAccount > 0 && prevState.idAccount !== this.context.user.id && !prevState.errorMessage) {
            this.setState({
                errorMessage: 'Нет прав'
            })
        }
    }

    updateData = () => {
        this.guildApi.getById(this.state.id).then(r => {
            delete r.id
            this.setState(r[0])
        }, err => {
            this.setState({
                errorMessage: err
            })
        }).finally(() => {
            this.setState({
                isLoaded: true
            })
        })
    }

    handleChange = (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>) => {
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

    handleChangeChecked = (e: ChangeEvent<HTMLInputElement>) => {
        this.handleChange({
            target: {
                id: e.target.id,
                value: Number(e.target.checked)
            }
        } as any)
    }

    handleImageChange = (e: any) => {
        const err = this.validator.validateImg(e.target.files[0])
        if (!!err) {
            this.setState({
                errorMessage: err,
                avatar: ''
            })
            e.target.value = ''
            return
        }
        this.setState({
            errorMessage: '',
            avatar: e.target.files[0]
        })
    }
    handleSubmit = (e: any) => {
        e.preventDefault()
        this.props.scrollTop()
        this.setState({
            errorMessage: '',
            isLoaded: false,
        })
        let guild = this.state as any as Guild
        let err = this.validator.validateGuild(guild)
        // err += this.validator.validateImg(this.state.avatar)
        if (!!err) {
            this.setState({
                errorMessage: err,
                isLoaded: true,
            })
            return
        }
        let formData = new FormData()
        formData.append('fileAvatar', this.state.avatar)
        formData.append('title', guild.title)
        formData.append('gameTitle', guild.gameTitle)
        formData.append('ideology', guild.ideology)
        formData.append('shortDescription', guild.shortDescription)
        formData.append('description', guild.description)
        formData.append('rule', guild.rule)
        formData.append('status', String(guild.status))
        formData.append('kit', String(guild.kit))
        formData.append('style', guild.style)
        formData.append('closed', String(guild.closed))
        formData.append('hidden', String(guild.hidden))
        formData.append('comment', String(guild.comment))
        this.guildApi.update(this.state.id, formData).then(r => {
            history.push('/material/guild/' + r)
        }, err => {
            this.setState({
                errorMessage: err
            })
        }).finally(() => {
            this.setState({
                isLoaded: true
            })
        })
    }

    render() {
        return (
            <div>
                {!this.state.isLoaded && <Spinner/>}
                {this.context.user.id === -1 &&
                <Redirect to={{pathname: "/login", state: {from: this.props.location}}}/>}
                <div className="edit-page guild-create">
                    <h1 className="title-page"><span className="title-page__icon"></span> Создание гильдии</h1>
                    <Form onSubmit={this.handleSubmit}>
                        <AlertDanger>{this.state.errorMessage}</AlertDanger>
                        <Row>
                            <Col md={6}>
                                <InputField label="Загрузите изображение гильдии" type="file"
                                            id="avatar" onChange={this.handleImageChange}/>
                            </Col>
                            <Col md={6}>
                                <h2 className="edit-page__subtitle">Главное</h2>
                                <InputField id="title" label="Название гильдии" placeholder="Введите название гильдии"
                                            type="text" value={this.state.title}
                                            onChange={this.handleChange}/>
                                <InputField id="gameTitle" label="Название гильдии в игре"
                                            placeholder="Введите название гильдии в игре"
                                            type="text" value={this.state.gameTitle}
                                            onChange={this.handleChange}/>
                                <InputField id="ideology" label="Мировозрение"
                                            placeholder="Введите мировозрение гильдии"
                                            type="text" value={this.state.ideology}
                                            onChange={this.handleChange}/>
                                <InputField id="shortDescription" label="Анонс"
                                            placeholder="Введите анонс гильдии"
                                            type="text" value={this.state.shortDescription}
                                            onChange={this.handleChange}/>

                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <h2 className="edit-page__subtitle">Основное</h2>
                                <Textarea id="description" label="Описание и история гильдии"
                                          placeholder="Опишите вашу гильдию и ее историю..."
                                          value={this.state.description}
                                          onChange={this.handleChange}/>
                                <Textarea id="rule" label="Условия и правила"
                                          placeholder="Напишите условия и правила для вашей гильдии..."
                                          value={this.state.rule}
                                          onChange={this.handleChange}/>
                                <Textarea id="articles" label="Список обсуждений/статей/логов"
                                          placeholder="Напишите список тут..."
                                          value={this.state.articles}
                                          onChange={this.handleChange}/>
                                <Textarea id="members" label="Список учасников"
                                          placeholder="Введите персонажей вашей гильдии..."
                                          value={this.state.members}
                                          onChange={this.handleChange}/>
                                <Textarea id="events" label="Список событий"
                                          placeholder="Введите события вашей гильдии..."
                                          value={this.state.events}
                                          onChange={this.handleChange}/>
                            </Col>
                            <Col md={6}>
                                <h2 className="edit-page__subtitle">Прочее</h2>
                                <Select id="status" label="Статус" placeholder="Выберите статус гильдии"
                                        value={this.state.status}
                                        onChange={this.handleChangeSelect}>
                                    {[0, 1, 2].map(v =>
                                        (<option key={v} value={v}>{guildStatusToString(v)}</option>)
                                    )}
                                </Select>
                                <Select label="Набор в гильдию" id="kit" value={this.state.kit}
                                        onChange={this.handleChangeSelect}>
                                    {[0, 1, 2].map(v =>
                                        (<option key={v} value={v}>{guildKitToString(v)}</option>)
                                    )}
                                </Select>
                                <Textarea id="style" label="CSS - стили(в разработке)"
                                          placeholder="Сюда поместите код..."
                                          value={this.state.style}
                                          onChange={this.handleChange}/>
                                <Textarea id="coauthors" label="Список соавторов"
                                          placeholder="Прикрепите соавторов материала (соавторы могут редактировать материал так же, как автор)."
                                          value={this.state.coauthors}
                                          onChange={this.handleChange}/>
                                <InputCheckBox id="closed" label="Закрыть(материал
                                будет доступен только автору)" checked={this.state.closed}
                                               onChange={this.handleChangeChecked}/>
                                <InputCheckBox id="hidden" label="Скрыть
                                из общих разделов(материал будет доступен по прямой ссылкуе и для прикрепления к другим
                                материалам)" checked={this.state.hidden}
                                               onChange={this.handleChangeChecked}/>
                                <InputCheckBox id="comment" label="Запретить
                                комментарии" checked={this.state.comment}
                                               onChange={this.handleChangeChecked}/>
                                <div className="from-group">
                                    <Button>Создать</Button>
                                </div>
                            </Col>
                        </Row>

                    </Form>
                </div>
            </div>
        )
    }
}

export default GuildEdit