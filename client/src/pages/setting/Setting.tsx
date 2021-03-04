import React from 'react'
import UserApi from '../../api/UserApi'
import userContext from '../../contexts/userContext'
import Spinner from '../../components/spinner/Spinner'
import history from '../../utils/history'
import Validator from '../../../../server/src/common/validator'
import {User, UserPassword} from '../../../../server/src/common/entity/types'
import InputField from '../../components/form/inputField/InputField'
import AlertDanger from '../../components/alertDanger/AlertDanger'
import {Redirect, RouteComponentProps} from 'react-router-dom'
import Form from '../../components/form/Form'
import Button from '../../components/button/Button'
import './Setting.scss'
import AlertAccept from '../../components/alertAccept/AlertAccept'
import Page from '../../components/page/Page'

type P = RouteComponentProps

type S = {
  email: string
  username: string
  passwordAccept: string
  passwordOld: string
  password: string
  passwordRepeat: string
  nickname: string
  linkDs: string
  linkMail: string
  linkVk: string
  linkTg: string
  avatar: File | null
  errorAvatar: string
  errorGeneral: string
  errorSecure: string
  acceptSecure: string
  errorPassword: string
  isLoaded: boolean
}

class Setting extends React.Component<P, S> {
  static contextType = userContext
  userApi = new UserApi()
  validator = new Validator()

  constructor(props: P) {
    super(props)
    this.state = {
      email: '',
      username: '',
      linkDs: '',
      linkMail: '',
      linkVk: '',
      linkTg: '',
      passwordAccept: '',
      passwordOld: '',
      password: '',
      passwordRepeat: '',
      nickname: '',
      avatar: null,
      errorAvatar: '',
      errorGeneral: '',
      acceptSecure: '',
      errorSecure: '',
      errorPassword: '',
      isLoaded: false,
    }
  }

  componentDidMount() {
    // Проверка, есть ли token в get параметрах
    const token = new URL(
      'http://example.com' + this.props.location.search
    ).searchParams.get('token')
    if (!!token) {
      // Если есть, то запросить подтверждение почты
      this.setState({
        isLoaded: false,
      })
      this.userApi
        .acceptEmail(token)
        .then(
          () => {
            this.setState({
              acceptSecure: 'Почта успешно подтверждена',
              isLoaded: true,
            })
          },
          (err) => {
            this.setState({
              errorSecure: err,
              isLoaded: true,
            })
          }
        )
        .finally(() => {
          this.props.history.replace(this.props.location.pathname)
        })
    }

    this.userApi
      .getGeneral()
      .then(
        (r) => {
          this.setState(r)
        },
        () => {
          history.push('/login')
        }
      )
      .finally(() => {
        this.setState({
          isLoaded: true,
        })
      })
  }

  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      errorGeneral: '',
      errorSecure: '',
      errorPassword: '',
      [e.target.name]: e.target.value,
    } as any)
  }

  handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const err = this.validator.validateImg(e.target.files![0])
    if (!!err) {
      this.setState({
        errorAvatar: err,
        avatar: null,
      })
      e.target.value = ''
      return
    }
    this.setState({
      errorAvatar: '',
      avatar: e.target.files![0],
    })
  }

  handleSubmitProfileAvatar = (e: React.FormEvent<HTMLFormElement>) => {
    this.setState({
      isLoaded: false,
      errorAvatar: '',
    })
    e.preventDefault()
    let formData = new FormData()
    formData.append('avatar', this.state.avatar!)
    this.userApi
      .updateAvatar(formData)
      .then(
        () => {
          this.setState({
            errorAvatar: '',
          })
          this.context.updateLogin()
        },
        (err) => {
          this.setState({
            errorAvatar: err,
          })
        }
      )
      .finally(() => {
        this.setState({
          isLoaded: true,
        })
      })
  }

  handleSubmitProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    let user = new User()
    user.nickname = this.state.nickname
    user.linkDs = this.state.linkDs
    user.linkMail = this.state.linkMail
    user.linkVk = this.state.linkVk
    user.linkTg = this.state.linkTg
    const err = this.validator.validateGeneral(user)
    if (!!err) {
      this.setState({
        errorGeneral: err,
      })
      return
    }
    this.setState({
      isLoaded: false,
      errorGeneral: '',
    })
    this.userApi
      .updateGeneral(user)
      .then(
        () => {
          this.context.updateLogin()
        },
        (err) => {
          this.setState({
            errorGeneral: err,
          })
        }
      )
      .finally(() => {
        this.setState({
          isLoaded: true,
        })
      })
  }

  handleSubmitSecure = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    let user = new User()
    user.email = this.state.email
    user.password = this.state.passwordAccept
    const err = this.validator.validateEmail(user)
    if (!!err) {
      this.setState({
        errorSecure: err,
      })
      return
    }
    this.setState({
      isLoaded: false,
      acceptSecure: '',
      errorSecure: '',
    })
    this.userApi
      .updateSecure(user)
      .then(
        (msg) => {
          this.setState({
            acceptSecure: msg,
          })
        },
        (err) => {
          this.setState({
            errorSecure: err,
          })
        }
      )
      .finally(() => {
        this.setState({
          isLoaded: true,
        })
      })
  }

  handleSubmitUserPassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    let user = new UserPassword()
    user.passwordAccept = this.state.passwordOld
    user.password = this.state.password
    user.passwordRepeat = this.state.passwordRepeat
    const err = this.validator.validatePassword(user)
    if (!!err) {
      this.setState({
        errorPassword: err,
      })
      return
    }
    this.setState({
      errorPassword: err,
      isLoaded: false,
    })
    this.userApi
      .updatePassword(user)
      .catch((err) => {
        this.setState({
          errorPassword: err,
        })
      })
      .finally(() => {
        this.setState({
          isLoaded: true,
        })
      })
  }

  render() {
    return (
      <Page>
        {!this.state.isLoaded && <Spinner />}
        <div className="page-setting">
          {this.context.user.id === -1 && (
            <Redirect
              to={{pathname: '/login', state: {from: this.props.location}}}
            />
          )}
          <Form onSubmit={this.handleSubmitProfileAvatar}>
            <div className="title">Загрузка аватара</div>
            <AlertDanger>{this.state.errorAvatar}</AlertDanger>
            <InputField
              label="Аватарка"
              type="file"
              id="avatar"
              onChange={this.handleImageChange}
            />
            <Form.Group>
              <Button>Загрузить</Button>
            </Form.Group>
          </Form>
          <Form onSubmit={this.handleSubmitProfile}>
            <div className="title">Общие настройки</div>
            <InputField
              label="Никнейм"
              type="text"
              value={this.state.nickname}
              id="nickname"
              onChange={this.handleChange}
            />
            <InputField
              label="Дискорд"
              placeholder="Example#1234"
              type="text"
              value={this.state.linkDs}
              id="linkDs"
              onChange={this.handleChange}
            />
            <InputField
              label="Почта"
              placeholder="example@example.com"
              type="text"
              value={this.state.linkMail}
              id="linkMail"
              onChange={this.handleChange}
            />
            <InputField
              label="Вконтакте"
              placeholder="id1234"
              type="text"
              value={this.state.linkVk}
              id="linkVk"
              onChange={this.handleChange}
            />
            <InputField
              label="Телеграм"
              placeholder="example"
              type="text"
              value={this.state.linkTg}
              id="linkTg"
              onChange={this.handleChange}
            />
            <Form.Group>
              <Button>Сохранить</Button>
            </Form.Group>
          </Form>
          <Form onSubmit={this.handleSubmitSecure}>
            <div className="title">Настройки безопасности</div>
            <AlertDanger>{this.state.errorSecure}</AlertDanger>
            <AlertAccept>{this.state.acceptSecure}</AlertAccept>
            <InputField
              label="E-mail"
              type="email"
              value={this.state.email}
              id="email"
              onChange={this.handleChange}
            />
            <InputField
              label="Подтверждение пароля"
              type="password"
              value={this.state.passwordAccept}
              id="passwordAccept"
              onChange={this.handleChange}
            />
            <Form.Group>
              <Button>Сохранить</Button>
            </Form.Group>
          </Form>
          <Form onSubmit={this.handleSubmitUserPassword}>
            <div className="title">Изменение пароля</div>
            <AlertDanger>{this.state.errorPassword}</AlertDanger>
            <InputField
              label="Старый пароль"
              type="password"
              value={this.state.passwordOld}
              id="passwordOld"
              onChange={this.handleChange}
            />
            <InputField
              label="Новый пароль"
              type="password"
              value={this.state.password}
              id="password"
              onChange={this.handleChange}
            />
            <InputField
              label="Повторите пароль"
              type="password"
              value={this.state.passwordRepeat}
              id="passwordRepeat"
              onChange={this.handleChange}
            />
            <Form.Group>
              <Button>Сохранить</Button>
            </Form.Group>
          </Form>
        </div>
      </Page>
    )
  }
}

export default Setting
