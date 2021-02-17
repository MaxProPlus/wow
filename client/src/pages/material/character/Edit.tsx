import React, {ChangeEvent} from 'react'
import Spinner from '../../../components/spinner/Spinner'
import Button from '../../../components/button/Button'
import InputField from '../../../components/form/inputField/InputField'
import AlertDanger from '../../../components/alert-danger/AlertDanger'
import {
    Character,
    characterActiveToString,
    characterStatusToString,
    sexToString,
    User,
} from '../../../../../server/src/common/entity/types'
import Validator from '../../../../../server/src/common/validator'
import history from '../../../utils/history'
import UserContext from '../../../contexts/userContext'
import {Redirect, RouteComponentProps} from 'react-router-dom'
import CharacterApi from '../../../api/CharacterApi'
import Textarea from '../../../components/form/textarea/Textarea'
import Select from '../../../components/form/select/Select'
import InputCheckBox from '../../../components/form/inputCheckBox/InputCheckBox'
import Form from '../../../components/form/Form'
import icon from '../../../img/brush.svg'
import {Col, Row} from 'react-bootstrap'
import Helper from '../../../utils/helper'
import MyCropper from '../../../components/myCropper/MyCropper'
import PageTitle from '../../../components/pageTitle/PageTitle'
import MyMultiSelect from '../../../components/myMultiSelect/MyMultiSelect'
import {MyMultiSelectInputEvent, MyMultiSelectListEvent, Option} from '../../../components/myMultiSelect/types'
import {CommonS, handleFormData} from './Common'
import {MatchId, RouteProps} from '../../../types/RouteProps'
import UserApi from '../../../api/UserApi'
import Page from '../../../components/page/Page'

type P = RouteProps & RouteComponentProps<MatchId>

type S = CommonS & {
    id: string
    urlAvatar: string,
    idUser: number
    isAdmin: boolean
    globalErrorMessage: string,
}

class CharacterEdit extends React.Component<P, S> {
    static contextType = UserContext
    private characterApi = new CharacterApi()
    private validator = new Validator()
    private avatar: File | null = null
    private userApi = new UserApi()

    constructor(props: P) {
        super(props)
        this.state = {
            ...new Character(),
            id: props.match.params.id,
            isLoaded: false,
            isAdmin: false,
            errorMessage: '',
            globalErrorMessage: '',
            friendsOptions: [],
            coauthorsOptions: [],
        }
    }

    componentDidMount() {
        this.updateData()
    }

    componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot?: any) {
        // Проверить есть ли права на редактирование
        if (!this.state.isAdmin && !this.state.globalErrorMessage // Если еще не выполнили проверку
            && this.context.user.id > 0 // Если контекст загружен
            && this.state.idUser !== 0) { // Если сюжет загружен

            // Проверяем есть ли id пользователя в массиве соавторов
            // Если есть, то он имеет право на редактирование
            // Если нет, то сравниваем id пользователя и id создателя материала
            const isAdmin = ((this.state.coauthors.findIndex((el: Option) => el.value === this.context.user.id) !== -1) ? true : this.context.user.id === this.state.idUser)
            this.setState({
                isAdmin,
                globalErrorMessage: isAdmin ? '' : 'Нет прав',
            })
        }
    }

    updateData = () => {
        this.characterApi.getById(this.state.id).then(r => {
            delete r.id
            r[0].friends = r[0].friends.map((el: Character) => {
                return {
                    label: el.title,
                    value: el.id,
                }
            })
            r[0].coauthors = r[0].coauthors.map((el: User) => {
                return {
                    label: el.nickname,
                    value: el.id,
                }
            })
            this.setState(r[0])
        }, err => {
            this.setState({
                errorMessage: err,
            })
        }).finally(() => {
            this.setState({
                isLoaded: true,
            })
        })
    }

    handleChange = (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>) => {
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

    handleChangeChecked = (e: ChangeEvent<HTMLInputElement>) => {
        this.handleChange({
            target: {
                id: e.target.id,
                value: Number(e.target.checked),
            },
        } as any)
    }

    handleImageChange = (dataurl: string) => {
        this.avatar = Helper.dataURLtoFile(dataurl)
    }

    handleChangeMultiSelect = (e: MyMultiSelectInputEvent) => {
        if (e.value === '') {
            this.setState({
                [e.id + 'Options']: [],
            } as any)
            return Promise.resolve()
        }
        switch (e.id) {
            case 'friends':
                return this.characterApi.getAll(3, 1, {title: e.value, hidden: 1}).then(r => {
                    this.setState({
                        // Отсечь элементы, которые уже были выбранны
                        friendsOptions: r.data.filter((el: Character) => {
                            return this.state.friends.findIndex((e: Option) => e.value === el.id,
                            ) === -1
                        }).map((el: Character) => {
                            return {
                                label: el.title,
                                value: el.id,
                            }
                        }),
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
                        coauthorsOptions: r.data.filter((el: User) => {
                            return this.state.coauthors.findIndex((e: Option) => e.value === el.id,
                            ) === -1
                        }).map((el: User) => {
                            return {
                                label: el.nickname,
                                value: el.id,
                            }
                        }),
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
        this.setState((state: S | any) => {
            return {
                [e.id]: [...state[e.id], {label: e.label, value: e.value}],
            } as any
        })
    }

    handleRemoveMultiSelect = (e: MyMultiSelectListEvent) => {
        this.setState((state: S | any) => {
            const index = state[e.id].findIndex((el: any) => el.value === e.value)
            return {
                [e.id]: [...state[e.id].slice(0, index), ...state[e.id].slice(index + 1)],
            } as any
        })
    }

    handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        this.setState({
            errorMessage: '',
            isLoaded: false,
        })
        let character = this.state as unknown as Character
        let err = this.validator.validateCharacter(character)
        err += this.validator.validateImg(this.avatar!)
        if (!!err) {
            this.props.scrollTop()
            this.setState({
                errorMessage: err,
                isLoaded: true,
            })
            return
        }
        let formData = handleFormData(character, this.avatar!)

        this.characterApi.update(this.state.id, formData).then(r => {
            history.push('/material/character/' + r)
        }, err => {
            this.props.scrollTop()
            this.setState({
                errorMessage: err,
            })
        }).finally(() => {
            this.setState({
                isLoaded: true,
            })
        })
    }

    render() {
        if (!!this.state.globalErrorMessage) {
            return (<Page><AlertDanger>{this.state.globalErrorMessage}</AlertDanger></Page>)
        }
        return (
            <Page>
                <div className="page-edit">
                    {!this.state.isLoaded && <Spinner/>}
                    {this.context.user.id === -1 &&
                    <Redirect to={{pathname: '/login', state: {from: this.props.location}}}/>}
                    <PageTitle className="mb-0" title="Редактирование персонажа" icon={icon}/>
                    <Form onSubmit={this.handleSubmit}>
                        <AlertDanger>{this.state.errorMessage}</AlertDanger>
                        <Row>
                            <Col md={6}>
                                <Row>
                                    <Col>
                                        <MyCropper label="Загрузите изображение персонажа" src={this.state.urlAvatar}
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
                                                (<option key={v} value={v}>{sexToString(v)}</option>),
                                            )}
                                        </Select>
                                    </Col>
                                    <Col className="un-board" md={4}>
                                        <Select label="Статус" id="status" value={this.state.status}
                                                onChange={this.handleChangeSelect}>
                                            {[0, 1, 2, 3].map(v =>
                                                (<option key={v} value={v}>{characterStatusToString(v)}</option>),
                                            )}
                                        </Select>
                                    </Col>
                                    <Col className="un-board" md={4}>
                                        <Select label="Активность" id="active" value={this.state.active}
                                                onChange={this.handleChangeSelect}>
                                            {[0, 1, 2, 3].map(v =>
                                                (<option key={v} value={v}>{characterActiveToString(v)}</option>),
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
                                                       value={this.state.coauthors}
                                                       options={this.state.coauthorsOptions}
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
                                            <Button>Сохранить</Button>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Form>
                </div>
            </Page>
        )
    }
}

export default CharacterEdit