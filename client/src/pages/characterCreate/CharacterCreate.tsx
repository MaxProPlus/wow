import React, {ChangeEvent} from "react"
import Spinner from "../../components/spinner/Spinner"
import Button from "../../components/button/Button";
import InputField from "../../components/form/inputField/InputField";
import AlertDanger from "../../components/alert-danger/AlertDanger";
import {
    activeToString,
    Character,
    characterStatusToString,
    sexToString
} from "../../../../server/src/common/entity/types";
import Validator from "../../../../server/src/common/validator";
import history from "../../utils/history";
import UserContext from "../../utils/userContext";
import {Redirect} from "react-router-dom";
import CharacterApi from "../../api/CharacterApi";
import Textarea from "../../components/form/textarea/Textarea";
import Select from "../../components/form/select/Select";
import InputCheckBox from "../../components/form/inputCheckBox/InputCheckBox";
import Form from "../../components/form/Form";

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
            history.push('/character/' + r)
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
                <div className="page-character-create">
                    <Form onSubmit={this.handleSubmit}>
                        <div className="title">Создание персонажа</div>
                        <AlertDanger>{this.state.errorMessage}</AlertDanger>
                        <InputField label="Аватарка персонажа" type="file"
                                    id="avatar" onChange={this.handleImageChange}/>
                        <InputField label="Полное имя персонажа" type="text" value={this.state.title}
                                    id="title" onChange={this.handleChange}/>
                        <InputField label="Игровое имя" type="text" value={this.state.nickname}
                                    id="nickname" onChange={this.handleChange}/>
                        <Textarea label="Девиз персонажа" id="shortDescription" value={this.state.shortDescription}
                                  onChange={this.handleChange}/>
                        <InputField label="Раса" type="text" value={this.state.race}
                                    id="race" onChange={this.handleChange}/>
                        <InputField label="Народность" type="text" value={this.state.nation}
                                    id="nation" onChange={this.handleChange}/>
                        <InputField label="Места пребывания" type="text" value={this.state.territory}
                                    id="territory" onChange={this.handleChange}/>
                        <InputField label="Возраст" type="number" value={this.state.age}
                                    id="age" onChange={this.handleChange}/>
                        <InputField label="Класс" type="text" value={this.state.className}
                                    id="className" onChange={this.handleChange}/>
                        <InputField label="Род занятий" type="text" value={this.state.occupation}
                                    id="occupation" onChange={this.handleChange}/>
                        <InputField label="Верования" type="text" value={this.state.religion}
                                    id="religion" onChange={this.handleChange}/>
                        <InputField label="Знание языков" type="text" value={this.state.languages}
                                    id="languages" onChange={this.handleChange}/>
                        <Textarea label="Описание" id="description" value={this.state.description}
                                  onChange={this.handleChange}
                                  rows={10}/>
                        <Select label="Пол" id="sex" value={this.state.sex}
                                onChange={this.handleChangeSelect}>
                            {[0, 1, 2].map(v =>
                                (<option key={v} value={v}>{sexToString(v)}</option>)
                            )}
                        </Select>
                        <Select label="Статус" id="status" value={this.state.status}
                                onChange={this.handleChangeSelect}>
                            {[0, 1, 2, 3].map(v =>
                                (<option key={v} value={v}>{characterStatusToString(v)}</option>)
                            )}
                        </Select>
                        <Select label="Активность" id="active" value={this.state.active}
                                onChange={this.handleChangeSelect}>
                            {[0, 1, 2, 3].map(v =>
                                (<option key={v} value={v}>{activeToString(v)}</option>)
                            )}
                        </Select>
                        <InputCheckBox label="Закрыть(материал
                                будет доступен только автору)" id="closed" value={this.state.closed}
                                       onChange={this.handleChangeChecked}/>
                        <InputCheckBox label="Скрыть
                                из общих разделов(материал будет доступен по прямой ссылкуе и для прикрепления к другим
                                материалам)" id="hidden" value={this.state.hidden}
                                       onChange={this.handleChangeChecked}/>
                        <InputCheckBox label="Запретить
                                комментарии" id="comment" value={this.state.comment}
                                       onChange={this.handleChangeChecked}/>
                        <Textarea label="CSS-стили(в разработке)" id="style" value={this.state.style}
                                  onChange={this.handleChange}
                                  rows={10}/>
                        <div className="from-group">
                            <Button>Создать</Button>
                        </div>

                    </Form>
                </div>
            </div>
        )
    }
}

export default CharacterCreate