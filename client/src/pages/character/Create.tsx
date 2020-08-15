import React, {ChangeEvent} from "react"
import Spinner from "../../components/spinner/Spinner"
import Button from "../../components/button/Button"
import InputField from "../../components/form/inputField/InputField"
import AlertDanger from "../../components/alert-danger/AlertDanger"
import {
    activeToString,
    Character,
    characterStatusToString,
    sexToString
} from "../../../../server/src/common/entity/types"
import Validator from "../../../../server/src/common/validator"
import history from "../../utils/history"
import UserContext from "../../utils/userContext"
import {Redirect} from "react-router-dom"
import CharacterApi from "../../api/CharacterApi"
import Textarea from "../../components/form/textarea/Textarea"
import Select from "../../components/form/select/Select"
import InputCheckBox from "../../components/form/inputCheckBox/InputCheckBox"
import Form from "../../components/form/Form"
import {Col, Row} from "react-bootstrap"
import icon from "../../components/edit/icon.svg"

type IState = {
    isLoaded: boolean
    errorMessage: string
    avatar: any
    title: string // Полное имя персонажа
    nickname: string // Игровое имя
    shortDescription: string // Девиз персонажа
    race: string // Раса
    nation: string // Народность
    territory: string // Места пребывания
    age: number // Возраст
    className: string // Класс
    occupation: string // Род занятий
    religion: string // Верования
    languages: string // Знание языков
    description: string // Описание???
    chars: [] // Список друзей

    // Прочее
    sex: number // Пол. 0 - не указан, 1 - женский, 2 - мужской
    status: number // Статус. 0 - жив, 1 - мертв, 2 - пропал
    active: number // Активность. 0 - отыгрыш еще не начат, 1 - в поиске отыгрыша, 2 - персонаж отыгрывается, 3-отыгрыш завершен
    closed: number // Закрыть(материал будет доступен только автору)
    hidden: number // Скрыть из общих разделов(материал будет доступен по прямой ссылкуе и для прикрепления к другим материалам)
    comment: number // Запретить комментарии
    style: string // CSS-стили
    coauthors: [] // Список соавторов
}

class CharacterCreate extends React.Component<any, IState> {
    static contextType = UserContext
    private characterApi = new CharacterApi()
    private validator = new Validator()

    constructor(props: any) {
        super(props)
        this.state = {
            isLoaded: true,
            errorMessage: '',
            avatar: '',
            title: '',
            nickname: '',
            shortDescription: '',
            race: '',
            nation: '',
            territory: '',
            age: 0,
            className: '',
            occupation: '',
            religion: '',
            languages: '',
            description: '',
            chars: [],
            sex: 0,
            status: 0,
            active: 0,
            closed: 0,
            hidden: 0,
            comment: 0,
            style: '',
            coauthors: []
        }
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
        let character = this.state as unknown as Character
        let err = this.validator.validateCharacter(character)
        // err += this.validator.validateImg(this.state.avatar)
        if (!!err) {
            this.setState({
                errorMessage: err,
                isLoaded: true,
            })
            return
        }
        let formData = new FormData()
        formData.append('title', character.title)
        formData.append('nickname', character.nickname)
        formData.append('shortDescription', character.shortDescription)
        formData.append('race', character.race)
        formData.append('nation', character.nation)
        formData.append('territory', character.territory)
        formData.append('age', String(character.age))
        formData.append('className', character.className)
        formData.append('occupation', character.occupation)
        formData.append('religion', character.religion)
        formData.append('languages', character.languages)
        formData.append('description', character.description)
        formData.append('sex', String(character.sex))
        formData.append('status', String(character.status))
        formData.append('active', String(character.active))
        formData.append('closed', String(character.closed))
        formData.append('hidden', String(character.hidden))
        formData.append('comment', String(character.comment))
        formData.append('fileAvatar', this.state.avatar)
        formData.append('style', character.style)
        this.characterApi.create(formData).then(r => {
            history.push('/material/character/' + r)
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
                <div className="page-edit page-character-create">
                    <div className="page-title">
                        <h1>
                            <img src={icon} alt=""/>Создание персонажа</h1>
                    </div>
                    <Form onSubmit={this.handleSubmit}>
                        <AlertDanger>{this.state.errorMessage}</AlertDanger>
                        <Row>
                            <Col md={6}>
                                <Row>
                                    <Col>
                                        <InputField label="Загрузите изображение персонажа" type="file"
                                                    id="avatar" onChange={this.handleImageChange}/>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <h2 className="page-edit__subtitle">Основное</h2>
                                        <Textarea label="Описание" id="description" value={this.state.description}
                                                  onChange={this.handleChange}
                                                  rows={10}/>
                                    </Col>
                                </Row>
                            </Col>
                            <Col md={6}>
                                <h2 className="page-edit__subtitle">Главное</h2>
                                <InputField id="title" label="Имя" placeholder="Введите имя персонажа" type="text"
                                            value={this.state.title}
                                            onChange={this.handleChange}/>
                                <InputField label="Игровое имя" type="text" placeholder="Введите игровое имя персонажа"
                                            value={this.state.nickname}
                                            id="nickname" onChange={this.handleChange}/>
                                <InputField id="age" label="Возраст" type="number"
                                            placeholder="Введите возраст персонажа"
                                            value={this.state.age}
                                            onChange={this.handleChange}/>
                                <InputField id="race" label="Раса" type="text" placeholder="Введите расу персонажа"
                                            value={this.state.race}
                                            onChange={this.handleChange}/>
                                <InputField id="nation" label="Народность" type="text"
                                            placeholder="Введите народность персонажа"
                                            value={this.state.nation}
                                            onChange={this.handleChange}/>
                                <InputField id="className" label="Класс" type="text"
                                            placeholder="Введите класс персонажа"
                                            value={this.state.className}
                                            onChange={this.handleChange}/>
                                <Textarea id="shortDescription" label="Девиз персонажа"
                                          placeholder="Введите девиз персонажа"
                                          value={this.state.shortDescription}
                                          onChange={this.handleChange}/>
                                <InputField id="religion" label="Верования" type="text"
                                            placeholder="Введите верования персонажа"
                                            value={this.state.religion}
                                            onChange={this.handleChange}/>
                                <InputField id="territory" label="Места пребывания" type="text"
                                            placeholder="Введите места пребывания персонажа"
                                            value={this.state.territory}
                                            onChange={this.handleChange}/>
                                <InputField id="languages" label="Знание языков" type="text"
                                            placeholder="Введите знания языков персонажа "
                                            value={this.state.languages}
                                            onChange={this.handleChange}/>
                                <InputField id="occupation" label="Род занятий" type="text"
                                            placeholder="Введите род занятии персонажа "
                                            value={this.state.occupation}
                                            onChange={this.handleChange}/>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <h2 className="page-edit__subtitle">Прочее</h2>
                                <Row className="un-board">
                                    <Col className="un-board" md={4}>
                                        <Select label="Пол" id="sex" value={this.state.sex}
                                                onChange={this.handleChangeSelect}>
                                            {[0, 1, 2].map(v =>
                                                (<option key={v} value={v}>{sexToString(v)}</option>)
                                            )}
                                        </Select>
                                    </Col>
                                    <Col className="un-board" md={4}>
                                        <Select label="Статус" id="status" value={this.state.status}
                                                onChange={this.handleChangeSelect}>
                                            {[0, 1, 2, 3].map(v =>
                                                (<option key={v} value={v}>{characterStatusToString(v)}</option>)
                                            )}
                                        </Select>
                                    </Col>
                                    <Col className="un-board" md={4}>
                                        <Select label="Активность" id="active" value={this.state.active}
                                                onChange={this.handleChangeSelect}>
                                            {[0, 1, 2, 3].map(v =>
                                                (<option key={v} value={v}>{activeToString(v)}</option>)
                                            )}
                                        </Select>
                                    </Col>
                                </Row>
                                <Row className="un-board">
                                    <Col className="un-board" md={6}>
                                        <Textarea label="CSS-стили(в разработке)" id="style" value={this.state.style}
                                                  onChange={this.handleChange}
                                                  rows={4}/>

                                    </Col>
                                    <Col className="un-board" md={6}>
                                        <InputCheckBox label="Закрыть(материал
                                будет доступен только автору)" id="closed" checked={this.state.closed}
                                                       onChange={this.handleChangeChecked}/>
                                        <InputCheckBox label="Скрыть
                                из общих разделов(материал будет доступен по прямой ссылкуе и для прикрепления к другим
                                материалам)" id="hidden" checked={this.state.hidden}
                                                       onChange={this.handleChangeChecked}/>
                                        <InputCheckBox label="Запретить
                                комментарии" id="comment" checked={this.state.comment}
                                                       onChange={this.handleChangeChecked}/>
                                        <div className="from-group">
                                            <Button>Создать</Button>
                                        </div>

                                    </Col>
                                </Row>
                            </Col>
                        </Row>

                    </Form>
                </div>
            </div>
        )
    }
}

export default CharacterCreate