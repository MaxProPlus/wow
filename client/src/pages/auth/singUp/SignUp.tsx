import React from 'react'
import {Link, RouteComponentProps} from 'react-router-dom'
import UserApi from '../../../api/UserApi'
import UserContext from '../../../contexts/userContext'
import AlertDanger from '../../../components/alert-danger/AlertDanger'
import Validator from '../../../../../server/src/common/validator'
import {User} from '../../../../../server/src/common/entity/types'
import InputField from '../../../components/form/inputField/InputField'
import Form from '../../../components/form/Form'
import Button from '../../../components/button/Button'
import './SignUp.scss'
import AlertAccept from '../../../components/alertAccept/AlertAccept'
import Spinner from '../../../components/spinner/Spinner'
import Page from '../../../components/page/Page'

type P = RouteComponentProps

type S = {
    isLoaded: boolean
    login: string
    email: string
    password: string
    passwordRepeat: string
    acceptMessage: string
    errorMessage: string
}

class SignUp extends React.Component<P, S> {
    static contextType = UserContext
    validator = new Validator()
    userApi = new UserApi()

    constructor(props: P) {
        super(props)
        this.state = {
            isLoaded: true,
            login: '',
            email: '',
            password: '',
            passwordRepeat: '',
            acceptMessage: '',
            errorMessage: '',
        }
    }

    handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        this.setState({
            isLoaded: false,
        })
        let user = new User()
        user.username = this.state.login
        user.email = this.state.email
        user.password = this.state.password
        user.passwordRepeat = this.state.passwordRepeat
        const err = this.validator.validateSignup(user)
        if (!!err) {
            this.setState({
                errorMessage: err,
            })
            return
        }
        this.userApi.signup(user).then((msg) => {
            this.setState({
                acceptMessage: msg,
                isLoaded: true,
            })
        }, err => {
            this.setState({
                errorMessage: err,
                isLoaded: true,
            })
        })
    }

    handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            errorMessage: '',
            acceptMessage: '',
            [e.target.name]: e.target.value,
        } as any)
    }

    render() {
        return (
            <Page>
                <div className="page-signup">
                    {!this.state.isLoaded && <Spinner/>}
                    <Form onSubmit={this.handleSubmit}>
                        <div className="title">Регистрация</div>
                        <AlertAccept>{this.state.acceptMessage}</AlertAccept>
                        <AlertDanger>{this.state.errorMessage}</AlertDanger>
                        <InputField label="E-mail" type="text" value={this.state.email}
                                    id="email" onChange={this.handleChange}/>
                        <InputField label="Имя пользователя" type="text" value={this.state.login}
                                    id="login" onChange={this.handleChange}/>
                        <InputField label="Пароль" type="password" value={this.state.password}
                                    id="password" onChange={this.handleChange}/>
                        <InputField label="Повторите пароль" type="password" value={this.state.passwordRepeat}
                                    id="passwordRepeat" onChange={this.handleChange}/>
                        <div className="form-group">
                            <Button className="btn-block">Регистрация</Button>
                        </div>
                        <div className="suggest">
                            Уже зарегистрированы? <Link to="/login">Войдите</Link>
                        </div>
                    </Form>
                </div>
            </Page>
        )
    }
}

export default SignUp