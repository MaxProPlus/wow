import React, {ChangeEvent} from "react"
import Spinner from "../../components/spinner/Spinner"
import Button from "../../components/button/Button"
import InputField from "../../components/form/inputField/InputField"
import AlertDanger from "../../components/alert-danger/AlertDanger"
import {
    Account,
    Character,
    characterActiveToString,
    characterStatusToString,
    defaultCharacterAvatar,
    sexToString
} from "../../../../server/src/common/entity/types"
import Validator from "../../../../server/src/common/validator"
import history from "../../utils/history"
import UserContext from "../../utils/userContext"
import {Redirect, RouteComponentProps} from "react-router-dom"
import CharacterApi from "../../api/CharacterApi"
import Textarea from "../../components/form/textarea/Textarea"
import Select from "../../components/form/select/Select"
import InputCheckBox from "../../components/form/inputCheckBox/InputCheckBox"
import Form from "../../components/form/Form"
import {Col, Row} from "react-bootstrap"
import icon from "../../img/brush.svg"
import Helper from "../../utils/helper"
import MyCropper from "../../components/myCropper/MyCropper"
import PageTitle from "../../components/pageTitle/PageTitle"
import {MyMultiSelectInputEvent, MyMultiSelectListEvent, Option} from "../../components/myMultiSelect/types"
import MyMultiSelect from "../../components/myMultiSelect/MyMultiSelect"
import {CommonS, handleFormData} from "./Common"
import {RouteProps} from "../../types/RouteProps"
import UserApi from "../../api/UserApi"

type P = RouteComponentProps & RouteProps

class CharacterCreate extends React.Component<P, CommonS> {
    static contextType = UserContext
    private characterApi = new CharacterApi()
    private userApi = new UserApi()
    private validator = new Validator()
    private avatar: File | any

    constructor(props: P) {
        super(props)
        this.state = {
            ...new Character(),
            isLoaded: true,
            errorMessage: '',
            friendsOptions: [],
            coauthorsOptions: [],
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
        this.avatar = Helper.dataURLtoFile(e)
    }

    handleChangeMultiSelect = (e: MyMultiSelectInputEvent) => {
        if (e.value === '') {
            this.setState({
                [e.id + 'Options']: []
            } as any)
            return Promise.resolve()
        }
        switch (e.id) {
            case 'friends':
                return this.characterApi.getAll(3, 1, {title: e.value}).then(r => {
                    this.setState({
                        // Отсечь элементы, которые уже были выбранны
                        friendsOptions: r.data.filter((el: Character) => {
                            return this.state.friends.findIndex((e: Option) => e.value === el.id
                            ) === -1
                        }).map((el: Character) => {
                            return {
                                label: el.title,
                                value: el.id
                            }
                        })
                    })
                }, err => {
                    this.setState({
                        errorMessage: err,
                    })
                })
            case 'coauthors':
                return this.userApi.getAll(3, 1, {nickname: e.value}).then(r => {
                    this.setState({
                        // Отсечь элементы, которые уже были выбранны
                        coauthorsOptions: r.data.filter((el: Account) => {
                            return this.state.coauthors.findIndex((e: Option) => e.value === el.id
                            ) === -1
                        }).map((el: Account) => {
                            return {
                                label: el.nickname,
                                value: el.id
                            }
                        })
                    })
                }, err => {
                    this.setState({
                        errorMessage: err,
                    })
                })
            default:
                return Promise.resolve()
        }
    }

    handleAddMultiSelect = (e: MyMultiSelectListEvent) => {
        this.setState((state: CommonS | any) => {
            return {
                [e.id]: [...state[e.id], {label: e.label, value: e.value}]
            } as any
        })
    }

    handleRemoveMultiSelect = (e: MyMultiSelectListEvent) => {
        this.setState((state: CommonS | any) => {
            const index = state[e.id].findIndex((el: any) => el.value === e.value)
            return {
                [e.id]: [...state[e.id].slice(0, index), ...state[e.id].slice(index + 1)]
            } as any
        })
    }

    handleSubmit = (e: any) => {
        e.preventDefault()
        this.setState({
            errorMessage: '',
            isLoaded: false,
        })
        let character = this.state as any as Character
        let err = this.validator.validateCharacter(character)
        // err += this.validator.validateImg(this.avatar)
        if (!!err) {
            this.props.scrollTop()
            this.setState({
                errorMessage: err,
                isLoaded: true,
            })
            return
        }
        let formData = handleFormData(character, this.avatar)

        this.characterApi.create(formData).then(r => {
            history.push('/material/character/' + r)
        }, err => {
            this.props.scrollTop()
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
            <div className="page-edit">
                {!this.state.isLoaded && <Spinner/>}
                {this.context.user.id === -1 &&
                <Redirect to={{pathname: "/login", state: {from: this.props.location}}}/>}
                <PageTitle className="mb-0" title="Создание персонажа" icon={icon}/>
                <Form onSubmit={this.handleSubmit}>
                    <AlertDanger>{this.state.errorMessage}</AlertDanger>
                    <Row>
                        <Col md={6}>
                            <Row>
                                <Col>
                                    <MyCropper label="Загрузите изображение персонажа" src={defaultCharacterAvatar}
                                               ratio={190 / 260}
                                               onChange={this.handleImageChange}/>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <h2 className="page-edit__subtitle">Основное</h2>
                                    <Textarea id="description" label="Внешность и характер"
                                              placeholder="Опишите внешность и характер персонажа..."
                                              value={this.state.description}
                                              onChange={this.handleChange}
                                              rows={3}/>
                                    <Textarea id="history" label="История персонажа"
                                              placeholder="Напишите историю данного персонажа..."
                                              value={this.state.history}
                                              onChange={this.handleChange}
                                              rows={3}/>
                                    <Textarea id="more" label="Дополнительные сведения"
                                              placeholder="Если есть то, что вы ещё не написали, то это тут..."
                                              value={this.state.more}
                                              onChange={this.handleChange}
                                              rows={3}/>
                                    <MyMultiSelect id="friends" label="Список друзей / знакомых персонажей"
                                                   placeholder="Введите всех друзей и знакомых данного персонажа..."
                                                   value={this.state.friends} options={this.state.friendsOptions}
                                                   onChange={this.handleChangeMultiSelect}
                                                   onAdd={this.handleAddMultiSelect}
                                                   onRemove={this.handleRemoveMultiSelect}/>
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
                                            (<option key={v} value={v}>{characterActiveToString(v)}</option>)
                                        )}
                                    </Select>
                                </Col>
                            </Row>
                            <Row className="un-board">
                                <Col className="un-board" md={6}>
                                    <Textarea label="CSS-стили(в разработке)" id="style" value={this.state.style}
                                              onChange={this.handleChange}
                                              rows={4}/>
                                    <MyMultiSelect id="coauthors" label="Список соавторов"
                                                   placeholder="Прикрепите соавторов материала (соавторы могут редактировать материал так же, как автор)."
                                                   value={this.state.coauthors} options={this.state.coauthorsOptions}
                                                   onChange={this.handleChangeMultiSelect}
                                                   onAdd={this.handleAddMultiSelect}
                                                   onRemove={this.handleRemoveMultiSelect}/>
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
                                    <Form.Group>
                                        <Button>Создать</Button>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Form>
            </div>
        )
    }
}

export default CharacterCreate