import React, {ChangeEvent} from "react"
import Validator from "../../../../server/src/common/validator"
import UserContext from "../../utils/userContext"
import Spinner from "../../components/spinner/Spinner"
import {Redirect} from "react-router-dom"
import Form from "../../components/form/Form"
import AlertDanger from "../../components/alert-danger/AlertDanger"
import Button from "../../components/button/Button"
import {Story, storyStatusToString} from "../../../../server/src/common/entity/types"
import {Col, Row} from "react-bootstrap"
import InputField from "../../components/form/inputField/InputField"
import Textarea from "../../components/form/textarea/Textarea"
import Select from "../../components/form/select/Select"
import InputCheckBox from "../../components/form/inputCheckBox/InputCheckBox"
import history from "../../utils/history"
import icon from "../../components/edit/icon.svg"
import StoryApi from "../../api/storyApi"
import MyCropper from "../../components/myCropper/MyCropper"
import Helper from "../../utils/helper"


type S = {
    id: string
    idAccount: number
    isLoaded: boolean
    errorMessage: string
    avatar: any
    urlAvatar: string

    // Главное
    title: string // Название сюжета
    dateStart: string // Дата начала
    period: string // Мировозрение
    shortDescription: string // Анонс

    // Основное
    description: string // Описание и история
    rule: string // Условия и правила
    more: string // Дополнительные сведения
    articles: string // Список обсуждений/статей/логов
    members: string // Список участников
    guilds: string // Список гильдий
    events: string // Список событий

    // Прочее
    status: number // Статус. 0 - активна, 1 - скоро открытие, 2 - распущена
    style: string // CSS-стили
    coauthors: [] // Список соавторов
    closed: number // Закрыть(материал будет доступен только автору)
    hidden: number // Скрыть из общих разделов(материал будет доступен по прямой ссылкуе и для прикрепления к другим материалам)
    comment: number // Запретить комментарии
}

class StoryEdit extends React.Component<any, S> {
    static contextType = UserContext
    private storyApi = new StoryApi()
    private validator = new Validator()

    constructor(props: any) {
        super(props)
        this.state = {
            id: props.match.params.id,
            idAccount: 0,
            isLoaded: true,
            errorMessage: '',
            avatar: '',
            urlAvatar: '',
            title: '',
            dateStart: (new Date()).toISOString().substr(0, 10),
            period: '',
            shortDescription: '',
            description: '',
            rule: '',
            more: '',
            articles: '',
            members: '',
            guilds: '',
            events: '',
            status: 0,
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
        this.storyApi.getById(this.state.id).then(r => {
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
        const file = Helper.dataURLtoFile(e)
        this.setState({
            errorMessage: '',
            avatar: file
        })
    }

    handleSubmit = (e: any) => {
        e.preventDefault()
        this.props.scrollTop()
        this.setState({
            errorMessage: '',
            isLoaded: false,
        })
        let story = this.state as any as Story
        let err = this.validator.validateStory(story)
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
        formData.append('title', story.title)
        formData.append('dateStart', story.dateStart)
        formData.append('period', story.period)
        formData.append('shortDescription', story.shortDescription)
        formData.append('description', story.description)
        formData.append('rule', story.rule)
        formData.append('more', story.more)
        formData.append('status', String(story.status))
        formData.append('style', story.style)
        formData.append('closed', String(story.closed))
        formData.append('hidden', String(story.hidden))
        formData.append('comment', String(story.comment))
        this.storyApi.update(this.state.id, formData).then(r => {
            history.push('/material/story/' + r)
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
                <div className="page-edit guild-create">
                    <div className="page-title">
                        <h1>
                            <img src={icon} alt=""/>Редактирование сюжета</h1>
                    </div>
                    <Form onSubmit={this.handleSubmit}>
                        <AlertDanger>{this.state.errorMessage}</AlertDanger>
                        <Row>
                            <Col md={6}>
                                <MyCropper label="Загрузите изображение сюжета" src={this.state.urlAvatar} ratio={260 / 190}
                                           onChange={this.handleImageChange}/>
                            </Col>
                            <Col md={6}>
                                <h2 className="page-edit__subtitle">Главное</h2>
                                <InputField id="title" label="Заголовок сюжета" placeholder="Введите название сюжета"
                                            type="text" value={this.state.title}
                                            onChange={this.handleChange}/>
                                <InputField id="dateStart" label="Дата начала" placeholder="Выберите дату начала сюжета"
                                            type="date" value={this.state.dateStart}
                                            onChange={this.handleChange}/>
                                <InputField id="period" label="Планируемый период отыгрыша"
                                            placeholder="Введите период отыгрыша (напр. апрель-май 2016г)"
                                            type="text" value={this.state.period}
                                            onChange={this.handleChange}/>
                                <InputField id="shortDescription" label="Анонс"
                                            placeholder="Введите анонс сюжета"
                                            type="text" value={this.state.shortDescription}
                                            onChange={this.handleChange}/>

                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <h2 className="page-edit__subtitle">Основное</h2>
                                <Textarea id="description" label="Описание сюжета"
                                          placeholder="Опишите ваш сюжет..."
                                          value={this.state.description}
                                          onChange={this.handleChange}/>
                                <Textarea id="rule" label="Условия и правила"
                                          placeholder="Введите важные детали или информацию в вашем сюжете..."
                                          value={this.state.rule}
                                          onChange={this.handleChange}/>
                                <Textarea id="more" label="Дополнительные сведения"
                                          placeholder="Если есть то, что вы еще не написали, то это тут..."
                                          value={this.state.more}
                                          onChange={this.handleChange}/>
                                <Textarea id="articles" label="Список обсуждений/статей/логов"
                                          placeholder="Напишите список тут..."
                                          value={this.state.articles}
                                          onChange={this.handleChange}/>
                                <Textarea id="members" label="Список персонажей-участников"
                                          placeholder="Введите персонажей вашего сюжета..."
                                          value={this.state.members}
                                          onChange={this.handleChange}/>
                                <Textarea id="guilds" label="Список гильдий-участников"
                                          placeholder="Введите гильдии, которые принимают участие в сюжете..."
                                          value={this.state.guilds}
                                          onChange={this.handleChange}/>
                                <Textarea id="events" label="Список событий"
                                          placeholder="Введите события вашего сюжета..."
                                          value={this.state.events}
                                          onChange={this.handleChange}/>
                            </Col>
                            <Col md={6}>
                                <h2 className="page-edit__subtitle">Прочее</h2>
                                <Select id="status" label="Статус" placeholder="Выберите статус c.;tnf"
                                        value={this.state.status}
                                        onChange={this.handleChangeSelect}>
                                    {[0, 1, 2, 3].map(v =>
                                        (<option key={v} value={v}>{storyStatusToString(v)}</option>)
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
                                    <Button>Сохранить</Button>
                                </div>
                            </Col>
                        </Row>

                    </Form>
                </div>
            </div>
        )
    }
}

export default StoryEdit