import React, {ChangeEvent} from 'react'
import Validator from '../../../../../server/src/common/validator'
import UserContext from '../../../contexts/userContext'
import Spinner from '../../../components/spinner/Spinner'
import {Redirect, RouteComponentProps} from 'react-router-dom'
import Form from '../../../components/form/Form'
import AlertDanger from '../../../components/alert-danger/AlertDanger'
import Button from '../../../components/button/Button'
import {
    Character,
    Guild,
    guildKitToString,
    guildStatusToString,
    User,
} from '../../../../../server/src/common/entity/types'
import {Col, Row} from 'react-bootstrap'
import InputField from '../../../components/form/inputField/InputField'
import Textarea from '../../../components/form/textarea/Textarea'
import Select from '../../../components/form/select/Select'
import InputCheckBox from '../../../components/form/inputCheckBox/InputCheckBox'
import GuildApi from '../../../api/GuildApi'
import history from '../../../utils/history'
import icon from '../../../img/brush.svg'
import Helper from '../../../utils/helper'
import MyCropper from '../../../components/myCropper/MyCropper'
import PageTitle from '../../../components/pageTitle/PageTitle'
import {CommonS, handleFormData} from './Common'
import {MyMultiSelectInputEvent, MyMultiSelectListEvent, Option} from '../../../components/myMultiSelect/types'
import MyMultiSelect from '../../../components/myMultiSelect/MyMultiSelect'
import CharacterApi from '../../../api/CharacterApi'
import {MatchId, RouteProps} from '../../../types/RouteProps'
import UserApi from '../../../api/UserApi'
import Page from '../../../components/page/Page'

type P = RouteComponentProps<MatchId> & RouteProps

type S = CommonS & {
    id: string
    urlAvatar: string
    idUser: number
    isAdmin: boolean
    globalErrorMessage: string
}

class GuildEdit extends React.Component<P, S> {
    static contextType = UserContext
    private guildApi = new GuildApi()
    private characterApi = new CharacterApi()
    private userApi = new UserApi()
    private validator = new Validator()
    private avatar: any

    constructor(props: P) {
        super(props)
        this.state = {
            ...new Guild(),
            id: props.match.params.id,
            isLoaded: false,
            isAdmin: false,
            errorMessage: '',
            globalErrorMessage: '',
            membersOptions: [],
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
        this.guildApi.getById(this.state.id).then(r => {
            delete r.id
            r[0].members = r[0].members.map((el: Character) => {
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

    handleImageChange = (e: any) => {
        this.avatar = Helper.dataURLtoFile(e)
    }

    handleChangeMultiSelect = (e: MyMultiSelectInputEvent) => {
        if (e.value === '') {
            this.setState({
                [e.id + 'Options']: [],
            } as any)
            return Promise.resolve()
        }
        switch (e.id) {
            case 'members':
                return this.characterApi.getAll(3, 1, {title: e.value}).then(r => {
                    this.setState({
                        // Отсечь элементы, которые уже были выбранны
                        membersOptions: r.data.filter((el: Character) => {
                            return this.state.members.findIndex((e: Option) => e.value === el.id,
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

    handleSubmit = (e: any) => {
        e.preventDefault()
        this.setState({
            errorMessage: '',
            isLoaded: false,
        })
        let guild = this.state as any as Guild
        let err = this.validator.validateGuild(guild)
        // err += this.validator.validateImg(this.avatar)
        if (!!err) {
            this.props.scrollTop()
            this.setState({
                errorMessage: err,
                isLoaded: true,
            })
            return
        }

        let formData = handleFormData(guild, this.avatar)
        this.guildApi.update(this.state.id, formData).then(r => {
            history.push('/material/guild/' + r)
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
                    <PageTitle className="mb-0" title="Редактирование гильдии" icon={icon}/>
                    <Form onSubmit={this.handleSubmit}>
                        <AlertDanger>{this.state.errorMessage}</AlertDanger>
                        <Row>
                            <Col md={6}>
                                <MyCropper label="Загрузите изображение гильдии" src={this.state.urlAvatar}
                                           ratio={260 / 190}
                                           onChange={this.handleImageChange}/>
                            </Col>
                            <Col md={6}>
                                <h2 className="page-edit__subtitle">Главное</h2>
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
                                <h2 className="page-edit__subtitle">Основное</h2>
                                <Textarea id="description" label="Описание и история гильдии"
                                          placeholder="Опишите вашу гильдию и ее историю..."
                                          value={this.state.description}
                                          onChange={this.handleChange}/>
                                <Textarea id="rule" label="Условия и правила"
                                          placeholder="Напишите условия и правила для вашей гильдии..."
                                          value={this.state.rule}
                                          onChange={this.handleChange}/>
                                <Textarea id="more" label="Дополнительные сведения"
                                          placeholder="Если есть то, что вы еще не написали, то это тут..."
                                          value={this.state.more}
                                          onChange={this.handleChange}/>
                                <MyMultiSelect id="members" label="Список учасников"
                                               placeholder="Введите персонажей вашей гильдии..."
                                               value={this.state.members} options={this.state.membersOptions}
                                               onChange={this.handleChangeMultiSelect}
                                               onAdd={this.handleAddMultiSelect}
                                               onRemove={this.handleRemoveMultiSelect}/>
                            </Col>
                            <Col md={6}>
                                <h2 className="page-edit__subtitle">Прочее</h2>
                                <Select id="status" label="Статус" placeholder="Выберите статус гильдии"
                                        value={this.state.status}
                                        onChange={this.handleChangeSelect}>
                                    {[0, 1, 2].map(v =>
                                        (<option key={v} value={v}>{guildStatusToString(v)}</option>),
                                    )}
                                </Select>
                                <Select label="Набор в гильдию" id="kit" value={this.state.kit}
                                        onChange={this.handleChangeSelect}>
                                    {[0, 1, 2].map(v =>
                                        (<option key={v} value={v}>{guildKitToString(v)}</option>),
                                    )}
                                </Select>
                                <Textarea id="style" label="CSS - стили(в разработке)"
                                          placeholder="Сюда поместите код..."
                                          value={this.state.style}
                                          onChange={this.handleChange}/>
                                <MyMultiSelect id="coauthors" label="Список соавторов"
                                               placeholder="Прикрепите соавторов материала (соавторы могут редактировать материал так же, как автор)."
                                               value={this.state.coauthors} options={this.state.coauthorsOptions}
                                               onChange={this.handleChangeMultiSelect}
                                               onAdd={this.handleAddMultiSelect}
                                               onRemove={this.handleRemoveMultiSelect}/>
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
                                <Form.Group>
                                    <Button>Сохранить</Button>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </div>
            </Page>
        )
    }
}

export default GuildEdit