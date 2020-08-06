import React from "react"
import UserApi from "../../api/userApi"
import userContext from "../../utils/userContext"
import Spinner from "../../components/spinner/Spinner"
import history from "../../utils/history"
import Validator from "../../../../server/src/common/validator"
import {Account, UserPassword} from "../../../../server/src/common/entity/types"
import InputField from "../../components/form/inputField/InputField";
import AlertDanger from "../../components/alert-danger/AlertDanger";
import {Redirect} from "react-router-dom";

type IState = {
    email: string,
    username: string,
    passwordAccept: string,
    passwordOld: string,
    password: string,
    passwordRepeat: string,
    nickname: string,
    avatar: any,
    errorAvatar: string,
    errorGeneral: string,
    errorSecure: string,
    errorPassword: string,
    isLoaded: boolean,
}

class Setting extends React.Component<any, IState> {
    static contextType = userContext;
    userApi = new UserApi();
    validator = new Validator();

    constructor(props: any) {
        super(props)
        this.state = {
            email: '',
            username: '',
            passwordAccept: '',
            passwordOld: '',
            password: '',
            passwordRepeat: '',
            nickname: '',
            avatar: '',
            errorAvatar: '',
            errorGeneral: '',
            errorSecure: '',
            errorPassword: '',
            isLoaded: false,
        }
    }

    componentDidMount() {
        this.userApi.getGeneral().then(r => {
            this.setState(r)
        }, () => {
            history.push('/login')
        }).finally(() => {
            this.setState({
                isLoaded: true,
            })
        })
    }

    handleChange = (e: any) => {
        this.setState({
            errorGeneral: '',
            errorSecure: '',
            errorPassword: '',
            [e.target.name]: e.target.value,
        } as { [K in keyof IState]: IState[K] })
    }

    handleImageChange = (e: any) => {
        console.log('handleImageChange')
        const err = this.validator.validateImg(e.target.files[0])
        if (!!err) {
            this.setState({
                errorAvatar: err,
                avatar: ''
            })
            e.target.value = ''
            return
        }
        this.setState({
            errorAvatar: '',
            avatar: e.target.files[0]
        })
    }

    handleSubmitProfileAvatar = (e: any) => {
        this.setState({
            isLoaded: false,
            errorAvatar: '',
        })
        e.preventDefault()
        let formData = new FormData()
        formData.append('avatar', this.state.avatar)
        this.userApi.updateAvatar(formData).then(() => {
            this.setState({
                errorAvatar: '',
            })
            this.context.updateLogin()
        }, (err) => {
            this.setState({
                errorAvatar: err,
            })
        }).finally(() => {
            this.setState({
                isLoaded: true,
            })
        })
    }

    handleSubmitProfile = (e: any) => {
        e.preventDefault()
        let user = new Account()
        user.nickname = this.state.nickname
        const {ok, err} = this.validator.validateGeneral(user)
        if (!ok) {
            this.setState({
                errorGeneral: err,
            })
            return
        }
        this.setState({
            isLoaded: false,
            errorGeneral: '',
        })
        this.userApi.updateGeneral(user).then(r => {
            this.setState(r)
            this.context.updateLogin()
        }, (err) => {
            this.setState({
                errorGeneral: err,
            })
        }).finally(() => {
            this.setState({
                isLoaded: true,
            })
        })
    }

    handleSubmitSecure = (e: any) => {
        e.preventDefault()
        let user = new Account()
        user.email = this.state.email
        user.username = this.state.username
        user.password = this.state.passwordAccept
        const {ok, err} = this.validator.validateSecure(user)
        if (!ok) {
            this.setState({
                errorSecure: err
            })
            return
        }
        this.setState({
            isLoaded: false,
            errorSecure: '',
        })
        this.userApi.updateSecure(user).catch(err => {
            this.setState({
                errorSecure: err,
            })
        }).finally(() => {
            this.setState({
                isLoaded: true,
            })
        })
    }

    handleSubmitUserPassword = (e: any) => {
        e.preventDefault()
        let user = new UserPassword()
        user.passwordAccept = this.state.passwordOld
        user.password = this.state.password
        user.passwordRepeat = this.state.passwordRepeat
        const {ok, err} = this.validator.validatePassword(user)
        if (!ok) {
            this.setState({
                errorPassword: err,
            })
            return
        }
        this.setState({
            errorPassword: err,
            isLoaded: false,
        })
        this.userApi.updatePassword(user).catch(err => {
            this.setState({
                errorPassword: err,
            })
        }).finally(() => {
            this.setState({
                isLoaded: true,
            })
        })
    }

    render() {
        return (
            <div>
                {!this.state.isLoaded && <Spinner/>}
                <div className="page-setting">
                    {this.context.user.id === -1 &&
                    <Redirect to={{pathname: "/login", state: {from: this.props.location}}}/>}
                    <form className="form-sign" onSubmit={this.handleSubmitProfileAvatar}>
                        <div className="title">Загрузка аватара</div>
                        <AlertDanger>{this.state.errorAvatar}</AlertDanger>
                        <div className="form-group">
                            <input className="fileInput" type="file" onChange={this.handleImageChange}/>
                        </div>
                        <div className="form-group">
                            <button>Загрузить</button>
                        </div>
                    </form>
                    <form className="form-sign" onSubmit={this.handleSubmitProfile}>
                        <div className="title">Общие настройки</div>
                        <AlertDanger>{this.state.errorGeneral}</AlertDanger>
                        <InputField label="Никнейм" type="text" value={this.state.nickname}
                                    id="nickname" onChange={this.handleChange}/>
                        <div className="form-group">
                            <button>Сохранить</button>
                        </div>
                    </form>
                    <form className="form-sign" onSubmit={this.handleSubmitSecure}>
                        <div className="title">Настройки безопасности</div>
                        <AlertDanger>{this.state.errorSecure}</AlertDanger>
                        <InputField label="E-mail" type="email" value={this.state.email}
                                    id="email" onChange={this.handleChange}/>
                        <InputField label="Username" type="text" value={this.state.username}
                                    id="username" onChange={this.handleChange}/>
                        <InputField label="Подтверждение пароля" type="password" value={this.state.passwordAccept}
                                    id="passwordAccept" onChange={this.handleChange}/>
                        <div className="form-group">
                            <button>Сохранить</button>
                        </div>
                    </form>
                    <form className="form-sign" onSubmit={this.handleSubmitUserPassword}>
                        <div className="title">Изменение пароля</div>
                        <AlertDanger>{this.state.errorPassword}</AlertDanger>
                        <InputField label="Старый пароль" type="password" value={this.state.passwordOld}
                                    id="passwordOld" onChange={this.handleChange}/>
                        <InputField label="Новый пароль" type="password" value={this.state.password}
                                    id="password" onChange={this.handleChange}/>
                        <InputField label="Повторите пароль" type="password" value={this.state.passwordRepeat}
                                    id="passwordRepeat" onChange={this.handleChange}/>
                        <div className="form-group">
                            <button>Сохранить</button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }
}

export default Setting