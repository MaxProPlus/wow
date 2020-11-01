import React, {Component} from 'react'
import {Link, RouteComponentProps} from 'react-router-dom'
import UserApi from '../../../api/UserApi'
import UserContext from '../../../contexts/userContext'
import Spinner from '../../../components/spinner/Spinner'
import AlertDanger from '../../../components/alert-danger/AlertDanger'
import {User} from '../../../../../server/src/common/entity/types'
import InputField from '../../../components/form/inputField/InputField'
import Form from '../../../components/form/Form'
import './SignIn.scss'
import Button from '../../../components/button/Button'
import AlertAccept from '../../../components/alertAccept/AlertAccept'
import Page from '../../../components/page/Page'

type P = RouteComponentProps<{}, {}, any>

type S = {
    username: string,
    password: string,
    isLoaded: boolean,
    acceptMessage: string,
    errorMessage: string,
}

class SignIn extends Component<P, S> {
    static contextType = UserContext
    userApi = new UserApi()

    constructor(props: P) {
        super(props)
        this.state = {
            username: '',
            password: '',
            isLoaded: true,
            acceptMessage: '',
            errorMessage: '',
        }
    }

    componentDidMount() {
        // Проверка, есть ли token в get параметрах
        const token = (new URL('http://example.com' + this.props.location.search)).searchParams.get('token')
        if (!!token) {
            // Если есть, то запросить подтверждение почты
            this.setState({
                isLoaded: false,
            })
            this.userApi.acceptReg(token).then(() => {
                this.setState({
                    acceptMessage: 'Почта успешно подтверждена',
                    isLoaded: true,
                })
            }, err => {
                this.setState({
                    errorMessage: err,
                    isLoaded: true,
                })
            }).finally(() => {
                this.props.history.replace(this.props.location.pathname)
            })
        }
    }

    handleSubmit = (e: any) => {
        e.preventDefault()

        this.setState({
            errorMessage: '',
            isLoaded: false,
        })
        let user = new User()
        user.username = this.state.username
        user.password = this.state.password
        this.userApi.signIn(user).then(() => {
            this.context.updateLogin().then(() => {
                let {from} = this.props.location.state || {from: {pathname: '/'}}
                this.props.history.replace(from)
            })
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

    handleChange = (e: any) => {
        this.setState({
            errorMessage: '',
            [e.target.id]: e.target.value,
        } as { [K in keyof S]: S[K] })
    }

    render() {
        return (
            <Page>
                <div className="page-signin">
                    <Form onSubmit={this.handleSubmit}>
                        {!this.state.isLoaded && <Spinner/>}
                        <div className="title">Вход</div>
                        <AlertAccept>{this.state.acceptMessage}</AlertAccept>
                        <AlertDanger>{this.state.errorMessage}</AlertDanger>
                        <InputField label="Имя пользователя" type="text" value={this.state.username}
                                    id="username" onChange={this.handleChange}/>
                        <InputField label="Пароль" type="password" value={this.state.password}
                                    id="password" onChange={this.handleChange}/>
                        <div className="form-group">
                            <Button className="btn-block">Вход</Button>
                        </div>
                        <div className="suggest">
                            Ещё нет аккаунта? <Link to="/signup">Зарегистрируйтесь</Link>
                        </div>
                    </Form>
                </div>
            </Page>
        )
    }
}

export default SignIn