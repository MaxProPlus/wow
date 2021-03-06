import React, {ChangeEvent} from 'react'
import Spinner from '../../../components/spinner/Spinner'
import Button from '../../../components/button/Button'
import InputField from '../../../components/form/inputField/InputField'
import AlertDanger from '../../../components/alertDanger/AlertDanger'
import {
  Character,
  Guild,
  Report,
  Story,
  User,
} from '../../../../../server/src/common/entity/types'
import Validator from '../../../../../server/src/common/validator'
import history from '../../../utils/history'
import UserContext from '../../../contexts/userContext'
import {Redirect, RouteComponentProps} from 'react-router-dom'
import Textarea from '../../../components/form/textarea/Textarea'
import InputCheckBox from '../../../components/form/inputCheckBox/InputCheckBox'
import Form from '../../../components/form/Form'
import {Col, Row} from 'react-bootstrap'
import icon from '../../../img/brush.svg'
import Helper from '../../../utils/helper'
import MyCropper from '../../../components/myCropper/MyCropper'
import PageTitle from '../../../components/pageTitle/PageTitle'
import {
  MyMultiSelectInputEvent,
  MyMultiSelectListEvent,
  Option,
} from '../../../components/myMultiSelect/types'
import MyMultiSelect from '../../../components/myMultiSelect/MyMultiSelect'
import {CommonS, handleFormData} from './Common'
import ReportApi from '../../../api/ReportApi'
import CharacterApi from '../../../api/CharacterApi'
import {RouteProps} from '../../../types/RouteProps'
import UserApi from '../../../api/UserApi'
import StoryApi from '../../../api/StoryApi'
import GuildApi from '../../../api/GuildApi'
import Page from '../../../components/page/Page'
import default260x190 from 'img/default260x190.png'

type P = RouteComponentProps & RouteProps

class ReportCreate extends React.Component<P, CommonS> {
  static contextType = UserContext
  private reportApi = new ReportApi()
  private characterApi = new CharacterApi()
  private guildApi = new GuildApi()
  private storyApi = new StoryApi()
  private userApi = new UserApi()
  private validator = new Validator()
  private avatar: File | null = null

  constructor(props: P) {
    super(props)
    this.state = {
      ...new Report(),
      isLoaded: true,
      errorMessage: '',
      membersOptions: [],
      guildsOptions: [],
      storesOptions: [],
      coauthorsOptions: [],
    }
  }

  handleChange = (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>
  ) => {
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
      case 'members':
        return this.characterApi.getAll(3, 1, {title: e.value, hidden: 1}).then(
          (r) => {
            this.setState({
              // Отсечь элементы, которые уже были выбранны
              membersOptions: r.data
                .filter((el: Character) => {
                  return (
                    this.state.members.findIndex(
                      (e: Option) => e.value === el.id
                    ) === -1
                  )
                })
                .map((el: Character) => {
                  return {
                    label: el.title,
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
      case 'guilds':
        return this.guildApi.getAll(3, 1, {title: e.value, hidden: 1}).then(
          (r) => {
            this.setState({
              // Отсечь элементы, которые уже были выбранны
              guildsOptions: r.data
                .filter((el: Character) => {
                  return (
                    this.state.guilds.findIndex(
                      (e: Option) => e.value === el.id
                    ) === -1
                  )
                })
                .map((el: Guild) => {
                  return {
                    label: el.title,
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
      case 'stores':
        return this.storyApi.getAll(3, 1, {title: e.value, hidden: 1}).then(
          (r) => {
            this.setState({
              // Отсечь элементы, которые уже были выбранны
              storesOptions: r.data
                .filter((el: Character) => {
                  return (
                    this.state.stores.findIndex(
                      (e: Option) => e.value === el.id
                    ) === -1
                  )
                })
                .map((el: Story) => {
                  return {
                    label: el.title,
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
    this.setState((state: CommonS | any) => {
      return {
        [e.id]: [...state[e.id], {label: e.label, value: e.value}],
      } as any
    })
  }

  handleRemoveMultiSelect = (e: MyMultiSelectListEvent) => {
    this.setState((state: CommonS | any) => {
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
    let report = (this.state as any) as Report
    let err = this.validator.validateReport(report)
    // err += this.validator.validateImg(this.avatar)
    if (!!err) {
      this.props.scrollTop()
      this.setState({
        errorMessage: err,
        isLoaded: true,
      })
      return
    }
    let formData = handleFormData(report, this.avatar!)

    this.reportApi
      .create(formData)
      .then(
        (r) => {
          history.push('/material/report/' + r)
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
            title="Создание отчета / лога"
            icon={icon}
          />
          <Form onSubmit={this.handleSubmit}>
            <AlertDanger>{this.state.errorMessage}</AlertDanger>
            <Row>
              <Col md={6}>
                <MyCropper
                  label="Загрузите изображение отчета / лога"
                  src={default260x190}
                  ratio={260 / 190}
                  onChange={this.handleImageChange}
                />
              </Col>
              <Col md={6}>
                <h2 className="page-edit__subtitle">Главное</h2>
                <InputField
                  id="title"
                  label="Заголовок отчёта / лога"
                  placeholder="Введите название отчёта / лога"
                  type="text"
                  value={this.state.title}
                  onChange={this.handleChange}
                />
                <Textarea
                  id="shortDescription"
                  label="Анонс"
                  placeholder="Введите анонс отчёта / лога"
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
                  label="Описание отчёта-лога"
                  placeholder="Опишите ваш отчёт / лог"
                  value={this.state.description}
                  onChange={this.handleChange}
                  rows={3}
                />
                <Textarea
                  id="rule"
                  label="Важная информация"
                  placeholder="Введите важные детали или информацию в вашем отчёте / логе"
                  value={this.state.rule}
                  onChange={this.handleChange}
                  rows={3}
                />
                <MyMultiSelect
                  id="members"
                  label="Список персонажей-участников"
                  placeholder="Введите персонажей-участников..."
                  value={this.state.members}
                  options={this.state.membersOptions}
                  onChange={this.handleChangeMultiSelect}
                  onAdd={this.handleAddMultiSelect}
                  onRemove={this.handleRemoveMultiSelect}
                />
                <MyMultiSelect
                  id="guilds"
                  label="Список гильдий-участников"
                  placeholder="Введите гильдии-участников..."
                  value={this.state.guilds}
                  options={this.state.guildsOptions}
                  onChange={this.handleChangeMultiSelect}
                  onAdd={this.handleAddMultiSelect}
                  onRemove={this.handleRemoveMultiSelect}
                />
                <MyMultiSelect
                  id="stores"
                  label="Список сюжетов-участников"
                  placeholder="Введите сюжетов-участников..."
                  value={this.state.stores}
                  options={this.state.storesOptions}
                  onChange={this.handleChangeMultiSelect}
                  onAdd={this.handleAddMultiSelect}
                  onRemove={this.handleRemoveMultiSelect}
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
                  <Button>Создать</Button>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </div>
      </Page>
    )
  }
}

export default ReportCreate
