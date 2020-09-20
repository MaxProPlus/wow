import React, {ChangeEvent} from "react"
import Spinner from "../../components/spinner/Spinner"
import Button from "../../components/button/Button"
import InputField from "../../components/form/inputField/InputField"
import AlertDanger from "../../components/alert-danger/AlertDanger"
import {Forum} from "../../../../server/src/common/entity/types"
import Validator from "../../../../server/src/common/validator"
import history from "../../utils/history"
import UserContext from "../../utils/userContext"
import {Redirect} from "react-router-dom"
import Textarea from "../../components/form/textarea/Textarea"
import InputCheckBox from "../../components/form/inputCheckBox/InputCheckBox"
import Form from "../../components/form/Form"
import icon from "../../img/brush.svg"
import {Col, Row} from "react-bootstrap"
import Helper from "../../utils/helper"
import MyCropper from "../../components/myCropper/MyCropper"
import PageTitle from "../../components/pageTitle/PageTitle"
import MyMultiSelect from "../../components/myMultiSelect/MyMultiSelect"
import {MyMultiSelectInputEvent, MyMultiSelectListEvent} from "../../components/myMultiSelect/types"
import {CommonS, handleFormData} from "./Common"
import ForumApi from "../../api/ForumApi"

type S = CommonS & {
    id: string
    urlAvatar: string,
    idAccount: number
}

class ForumEdit extends React.Component<any, S> {
    static contextType = UserContext
    private forumApi = new ForumApi()
    private validator = new Validator()
    private avatar: File | any

    constructor(props: any) {
        super(props)
        this.state = {
            ...new Forum(),
            id: props.match.params.id,
            isLoaded: false,
            errorMessage: '',
            coauthorsOptions: [],
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
        this.forumApi.getById(this.state.id).then(r => {
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
            case 'coauthors':
                return Promise.resolve()
            default:
                return Promise.resolve()
        }
    }

    handleAddMultiSelect = (e: MyMultiSelectListEvent) => {
        this.setState((state: S | any) => {
            return {
                [e.id]: [...state[e.id], {label: e.label, value: e.value}]
            } as any
        })
    }

    handleRemoveMultiSelect = (e: MyMultiSelectListEvent) => {
        this.setState((state: S | any) => {
            const index = state[e.id].findIndex((el: any) => el.value === e.value)
            return {
                [e.id]: [...state[e.id].slice(0, index), ...state[e.id].slice(index + 1)]
            } as any
        })
    }

    handleSubmit = (e: any) => {
        e.preventDefault()
        this.props.scrollTop()
        this.setState({
            errorMessage: '',
            isLoaded: false,
        })
        let forum = this.state as unknown as Forum
        let err = this.validator.validateForum(forum)
        err += this.validator.validateImg(this.avatar)
        if (!!err) {
            this.setState({
                errorMessage: err,
                isLoaded: true,
            })
            return
        }
        let formData = handleFormData(forum, this.avatar)

        this.forumApi.update(this.state.id, formData).then(r => {
            history.push('/material/forum/' + r)
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
            <div className="page-edit">
                {!this.state.isLoaded && <Spinner/>}
                {this.context.user.id === -1 &&
                <Redirect to={{pathname: "/login", state: {from: this.props.location}}}/>}
                <PageTitle className="mb-0" title="Редактирование форума" icon={icon}/>
                <Form onSubmit={this.handleSubmit}>
                    <AlertDanger>{this.state.errorMessage}</AlertDanger>
                    <Row>
                        <Col md={6}>
                            <MyCropper label="Загрузите изображение форума" src={this.state.urlAvatar}
                                       ratio={260 / 190}
                                       onChange={this.handleImageChange}/>
                        </Col>
                        <Col md={6}>
                            <h2 className="page-edit__subtitle">Главное</h2>
                            <InputField id="title" label="Заголовок форума" placeholder="Введите название форумв"
                                        type="text"
                                        value={this.state.title}
                                        onChange={this.handleChange}/>
                            <Textarea id="shortDescription" label="Анонс"
                                      placeholder="Введите анонс форума"
                                      value={this.state.shortDescription}
                                      onChange={this.handleChange}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <h2 className="page-edit__subtitle">Основное</h2>
                            <Textarea id="description" label="Описание форума"
                                      placeholder="Опишите вашу тему обсуждения..."
                                      value={this.state.description}
                                      onChange={this.handleChange}
                                      rows={3}/>
                            <Textarea id="rule" label="Важная информация"
                                      placeholder="Введите важные детали или информацию в вашем форуме"
                                      value={this.state.rule}
                                      onChange={this.handleChange}
                                      rows={3}/>
                        </Col>
                        <Col md={6}>
                            <h2 className="page-edit__subtitle">Прочее</h2>
                            <Textarea label="CSS-стили(в разработке)" id="style" value={this.state.style}
                                      onChange={this.handleChange}
                                      rows={4}/>
                            <MyMultiSelect id="coauthors" label="Список соавторов"
                                           placeholder="Прикрепите соавторов материала (соавторы могут редактировать материал так же, как автор)."
                                           value={this.state.coauthors} options={this.state.coauthorsOptions}
                                           onChange={this.handleChangeMultiSelect}
                                           onAdd={this.handleAddMultiSelect}
                                           onRemove={this.handleRemoveMultiSelect}/>
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
                </Form>
            </div>
        )
    }
}

export default ForumEdit