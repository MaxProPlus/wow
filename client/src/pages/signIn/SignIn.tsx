import React, {Component} from 'react'
import {Link} from "react-router-dom"
import UserApi from "../../api/UserApi"
import UserContext from "../../utils/userContext"
import Spinner from "../../components/spinner/Spinner"
import AlertDanger from "../../components/alert-danger/AlertDanger"
import {Account} from "../../../../server/src/common/entity/types"
import InputField from "../../components/form/inputField/InputField"
import Form from "../../components/form/Form"
import './SignIn.scss'
import Button from "../../components/button/Button"

type stateTypes = {
    username: string,
    password: string,
    isLoaded: boolean,
    errorMessage: string,
}

class SignIn extends Component<any, stateTypes> {
    static contextType = UserContext
    userApi = new UserApi()

    constructor(props: any) {
        super(props)
        this.state = {
            username: '',
            password: '',
            isLoaded: true,
            errorMessage: '',
        }
    }

    handleSubmit = (e: any) => {
        e.preventDefault()

        this.setState({
            errorMessage: '',
            isLoaded: false,
        })
        let user = new Account()
        user.username = this.state.username
        user.password = this.state.password
        this.userApi.signIn(user).then(() => {
            this.context.updateLogin().then(() => {
                let {from} = this.props.location.state || {from: {pathname: '/'}}
                this.props.history.replace(from)
            })
        }, err => {
            this.setState({
                errorMessage: err
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
        } as { [K in keyof stateTypes]: stateTypes[K] })
    }

    render() {
        return (
            <div className="page-signin">
                <Form onSubmit={this.handleSubmit}>
                    {!this.state.isLoaded && <Spinner/>}
                    <div className="title">Вход</div>
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
        )
    }
}

export default SignIn