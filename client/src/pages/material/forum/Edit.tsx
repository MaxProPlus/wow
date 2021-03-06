import React, {ChangeEvent} from 'react'
import Spinner from '../../../components/spinner/Spinner'
import Button from '../../../components/button/Button'
import InputField from '../../../components/form/inputField/InputField'
import AlertDanger from '../../../components/alertDanger/AlertDanger'
import {Forum, User} from '../../../../../server/src/common/entity/types'
import Validator from '../../../../../server/src/common/validator'
import history from '../../../utils/history'
import UserContext from '../../../contexts/userContext'
import {Redirect, RouteComponentProps} from 'react-router-dom'
import Textarea from '../../../components/form/textarea/Textarea'
import InputCheckBox from '../../../components/form/inputCheckBox/InputCheckBox'
import Form from '../../../components/form/Form'
import icon from '../../../img/brush.svg'
import {Col, Row} from 'react-bootstrap'
import Helper from '../../../utils/helper'
import MyCropper from '../../../components/myCropper/MyCropper'
import PageTitle from '../../../components/pageTitle/PageTitle'
import MyMultiSelect from '../../../components/myMultiSelect/MyMultiSelect'
import {
  MyMultiSelectInputEvent,
  MyMultiSelectListEvent,
  Option,
} from '../../../components/myMultiSelect/types'
import {CommonS, handleFormData} from './Common'
import ForumApi from '../../../api/ForumApi'
import {MatchId, RouteProps} from '../../../types/RouteProps'
import UserApi from '../../../api/UserApi'
import Page from '../../../components/page/Page'

type P = RouteProps & RouteComponentProps<MatchId>

type S = CommonS & {
  id: string
  urlAvatar: string
  idUser: number
  isAdmin: boolean
  globalErrorMessage: string
}

class ForumEdit extends React.Component<P, S> {
  static contextType = UserContext
  private forumApi = new ForumApi()
  private userApi = new UserApi()
  private validator = new Validator()
  private avatar: File | null = null

  constructor(props: P) {
    super(props)
    this.state = {
      ...new Forum(),
      id: props.match.params.id,
      isLoaded: false,
      isAdmin: false,
      errorMessage: '',
      globalErrorMessage: '',
      coauthorsOptions: [],
    }
  }

  componentDidMount() {
    this.updateData()
  }

  componentDidUpdate(
    prevProps: Readonly<P>,
    prevState: Readonly<S>,
    snapshot?: any
  ) {
    // Проверить есть ли права на редактирование
    if (
      !this.state.isAdmin &&
      !this.state.globalErrorMessage && // Если еще не выполнили проверку
      this.context.user.id > 0 && // Если контекст загружен
      this.state.idUser !== 0
    ) {
      // Если сюжет загружен

      // Проверяем есть ли id пользователя в массиве соавторов
      // Если есть, то он имеет право на редактирование
      // Если нет, то сравниваем id пользователя и id создателя материала
      const isAdmin =
        this.state.coauthors.findIndex(
          (el: Option) => el.value === this.context.user.id
        ) !== -1
          ? true
          : this.context.user.id === this.state.idUser
      this.setState({
        isAdmin,
        globalErrorMessage: isAdmin ? '' : 'Нет прав',
      })
    }
  }

  updateData = () => {
    this.forumApi
      .getById(this.state.id)
      .then(
        (r) => {
          delete r.id
          r[0].coauthors = r[0].coauthors.map((el: User) => {
            return {
              label: el.nickname,
              value: el.id,
            }
          })
          this.setState(r[0])
        },
        (err) => {
          this.setState({
            errorMessage: err,
          })
        }
      )
      .finally(() => {
        this.setState({
          isLoaded: true,
        })
      })
  }

  handleChange = (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>
  ) => {
    this.setState({
      errorMessage: '',
      [e.target.id]: e.target.value,
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
      case 'coauthors':
        return this.userApi.getAll(3, 1, {nickname: e.value}).then(
          (r) => {
            this.setState({
              // Отсечь элементы, которые уже были выбранны
              coauthorsOptions: r.data
                .filter((el: User) => {
                  return (
                    this.state.coauthors.findIndex(
                      (e: Option) => e.value === el.id
                    ) === -1
                  )
                })
                .map((el: User) => {
                  return {
                    label: el.nickname,
                    value: el.id,
                  }
                }),
            })
          },
          (err) => {
            this.setState({
              errorMessage: err,
            })
          }
        )
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
        [e.id]: [
          ...state[e.id].slice(0, index),
          ...state[e.id].slice(index + 1),
        ],
      } as any
    })
  }

  handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    this.setState({
      errorMessage: '',
      isLoaded: false,
    })
    let forum = (this.state as unknown) as Forum
    let err = this.validator.validateForum(forum)
    err += this.validator.validateImg(this.avatar!)
    if (!!err) {
      this.props.scrollTop()
      this.setState({
        errorMessage: err,
        isLoaded: true,
      })
      return
    }
    let formData = handleFormData(forum, this.avatar!)

    this.forumApi
      .update(this.state.id, formData)
      .then(
        (r) => {
          history.push('/material/forum/' + r)
        },
        (err) => {
          this.props.scrollTop()
          this.setState({
            errorMessage: err,
          })
        }
      )
      .finally(() => {
        this.setState({
          isLoaded: true,
        })
      })
  }

  render() {
    if (!!this.state.globalErrorMessage) {
      return (
        <Page>
          <AlertDanger>{this.state.globalErrorMessage}</AlertDanger>
        </Page>
      )
    }
    return (
      <Page>
        <div className="page-edit">
          {!this.state.isLoaded && <Spinner />}
          {this.context.user.id === -1 && (
            <Redirect
              to={{pathname: '/login', state: {from: this.props.location}}}
            />
          )}
          <PageTitle
            className="mb-0"
            title="Редактирование форума"
            icon={icon}
          />
          <Form onSubmit={this.handleSubmit}>
            <AlertDanger>{this.state.errorMessage}</AlertDanger>
            <Row>
              <Col md={6}>
                <MyCropper
                  label="Загрузите изображение форума"
                  src={this.state.urlAvatar}
                  ratio={260 / 190}
                  onChange={this.handleImageChange}
                />
              </Col>
              <Col md={6}>
                <h2 className="page-edit__subtitle">Главное</h2>
                <InputField
                  id="title"
                  label="Заголовок форума"
                  placeholder="Введите название форума"
                  type="text"
                  value={this.state.title}
                  onChange={this.handleChange}
                />
                <Textarea
                  id="shortDescription"
                  label="Анонс"
                  placeholder="Введите анонс форума"
                  value={this.state.shortDescription}
                  onChange={this.handleChange}
                />
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <h2 className="page-edit__subtitle">Основное</h2>
                <Textarea
                  id="description"
                  label="Описание форума"
                  placeholder="Опишите вашу тему обсуждения..."
                  value={this.state.description}
                  onChange={this.handleChange}
                  rows={3}
                />
                <Textarea
                  id="rule"
                  label="Важная информация"
                  placeholder="Введите важные детали или информацию в вашем форуме"
                  value={this.state.rule}
                  onChange={this.handleChange}
                  rows={3}
                />
              </Col>
              <Col md={6}>
                <h2 className="page-edit__subtitle">Прочее</h2>
                <Textarea
                  label="CSS-стили(в разработке)"
                  id="style"
                  value={this.state.style}
                  onChange={this.handleChange}
                  rows={4}
                />
                <MyMultiSelect
                  id="coauthors"
                  label="Список соавторов"
                  placeholder="Прикрепите соавторов материала (соавторы могут редактировать материал так же, как автор)."
                  value={this.state.coauthors}
                  options={this.state.coauthorsOptions}
                  onChange={this.handleChangeMultiSelect}
                  onAdd={this.handleAddMultiSelect}
                  onRemove={this.handleRemoveMultiSelect}
                />
                <InputCheckBox
                  label="Закрыть(материал
                                будет доступен только автору)"
                  id="closed"
                  checked={this.state.closed}
                  onChange={this.handleChangeChecked}
                />
                <InputCheckBox
                  label="Скрыть
                                из общих разделов(материал будет доступен по прямой ссылкуе и для прикрепления к другим
                                материалам)"
                  id="hidden"
                  checked={this.state.hidden}
                  onChange={this.handleChangeChecked}
                />
                <InputCheckBox
                  label="Запретить
                                комментарии"
                  id="comment"
                  checked={this.state.comment}
                  onChange={this.handleChangeChecked}
                />
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

export default ForumEdit
