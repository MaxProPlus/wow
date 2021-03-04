import React, {ChangeEvent} from 'react'
import Validator from '../../../../../server/src/common/validator'
import UserContext from '../../../contexts/userContext'
import Spinner from '../../../components/spinner/Spinner'
import {Redirect, RouteComponentProps} from 'react-router-dom'
import Form from '../../../components/form/Form'
import AlertDanger from '../../../components/alertDanger/AlertDanger'
import Button from '../../../components/button/Button'
import {
  Character,
  Guild,
  Story,
  storyStatusToString,
  User,
} from '../../../../../server/src/common/entity/types'
import {Col, Row} from 'react-bootstrap'
import InputField from '../../../components/form/inputField/InputField'
import Textarea from '../../../components/form/textarea/Textarea'
import Select from '../../../components/form/select/Select'
import InputCheckBox from '../../../components/form/inputCheckBox/InputCheckBox'
import history from '../../../utils/history'
import icon from '../../../img/brush.svg'
import StoryApi from '../../../api/StoryApi'
import MyCropper from '../../../components/myCropper/MyCropper'
import Helper from '../../../utils/helper'
import PageTitle from '../../../components/pageTitle/PageTitle'
import {CommonS, handleFormData} from './Common'
import {
  MyMultiSelectInputEvent,
  MyMultiSelectListEvent,
  Option,
} from '../../../components/myMultiSelect/types'
import CharacterApi from '../../../api/CharacterApi'
import MyMultiSelect from '../../../components/myMultiSelect/MyMultiSelect'
import GuildApi from '../../../api/GuildApi'
import {RouteProps} from '../../../types/RouteProps'
import UserApi from '../../../api/UserApi'
import Page from '../../../components/page/Page'
import default260x190 from 'img/default260x190.png'

type P = RouteComponentProps & RouteProps

class StoryCreate extends React.Component<P, CommonS> {
  static contextType = UserContext
  private storyApi = new StoryApi()
  private characterApi = new CharacterApi()
  private guildApi = new GuildApi()
  private userApi = new UserApi()
  private validator = new Validator()
  private avatar: File | null = null

  constructor(props: P) {
    super(props)
    this.state = {
      ...new Story(),
      isLoaded: true,
      errorMessage: '',
      membersOptions: [],
      guildsOptions: [],
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

  handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    this.setState({
      errorMessage: '',
      isLoaded: false,
    })
    let story = (this.state as any) as Story
    let err = this.validator.validateStory(story)
    // err += this.validator.validateImg(this.state.avatar)
    if (!!err) {
      this.props.scrollTop()
      this.setState({
        errorMessage: err,
        isLoaded: true,
      })
      return
    }
    let formData = handleFormData(story, this.avatar!)
    this.storyApi
      .create(formData)
      .then(
        (r) => {
          history.push('/material/story/' + r)
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
                .filter((el: Guild) => {
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
          <PageTitle className="mb-0" title="Создание сюжета" icon={icon} />
          <Form onSubmit={this.handleSubmit}>
            <AlertDanger>{this.state.errorMessage}</AlertDanger>
            <Row>
              <Col md={6}>
                <MyCropper
                  label="Загрузите изображение сюжета"
                  src={default260x190}
                  ratio={260 / 190}
                  onChange={this.handleImageChange}
                />
              </Col>
              <Col md={6}>
                <h2 className="page-edit__subtitle">Главное</h2>
                <InputField
                  id="title"
                  label="Заголовок сюжета"
                  placeholder="Введите название сюжета"
                  type="text"
                  value={this.state.title}
                  onChange={this.handleChange}
                />
                <InputField
                  id="dateStart"
                  label="Дата начала"
                  placeholder="Выберите дату начала сюжета"
                  type="date"
                  value={this.state.dateStart}
                  onChange={this.handleChange}
                />
                <InputField
                  id="period"
                  label="Планируемый период отыгрыша"
                  placeholder="Введите период отыгрыша (напр. апрель-май 2016г)"
                  type="text"
                  value={this.state.period}
                  onChange={this.handleChange}
                />
                <InputField
                  id="shortDescription"
                  label="Анонс"
                  placeholder="Введите анонс сюжета"
                  type="text"
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
                  label="Описание сюжета"
                  placeholder="Опишите ваш сюжет..."
                  value={this.state.description}
                  onChange={this.handleChange}
                />
                <Textarea
                  id="rule"
                  label="Условия и правила"
                  placeholder="Введите важные детали или информацию в вашем сюжете..."
                  value={this.state.rule}
                  onChange={this.handleChange}
                />
                <Textarea
                  id="more"
                  label="Дополнительные сведения"
                  placeholder="Если есть то, что вы еще не написали, то это тут..."
                  value={this.state.more}
                  onChange={this.handleChange}
                />
                {/*<MyMultiSelect id="articles" label="Список обсуждений/статей/логов"*/}
                {/*               placeholder="Напишите список тут..."*/}
                {/*               value={this.state.articles} options={this.state.articlesOptions}*/}
                {/*               onChange={this.handleChangeMultiSelect}*/}
                {/*               onAdd={this.handleAddMultiSelect}*/}
                {/*               onRemove={this.handleRemoveMultiSelect}/>*/}
                <MyMultiSelect
                  id="members"
                  label="Список персонажей-участников"
                  placeholder="Введите персонажей вашего сюжета..."
                  value={this.state.members}
                  options={this.state.membersOptions}
                  onChange={this.handleChangeMultiSelect}
                  onAdd={this.handleAddMultiSelect}
                  onRemove={this.handleRemoveMultiSelect}
                />
                <MyMultiSelect
                  id="guilds"
                  label="Список гильдий-участников"
                  placeholder="Введите гильдии, которые принимают участие в сюжете..."
                  value={this.state.guilds}
                  options={this.state.guildsOptions}
                  onChange={this.handleChangeMultiSelect}
                  onAdd={this.handleAddMultiSelect}
                  onRemove={this.handleRemoveMultiSelect}
                />
              </Col>
              <Col md={6}>
                <h2 className="page-edit__subtitle">Прочее</h2>
                <Select
                  id="status"
                  label="Статус"
                  placeholder="Выберите статус"
                  value={this.state.status}
                  onChange={this.handleChangeSelect}
                >
                  {[0, 1, 2, 3].map((v) => (
                    <option key={v} value={v}>
                      {storyStatusToString(v)}
                    </option>
                  ))}
                </Select>
                <Textarea
                  id="style"
                  label="CSS - стили(в разработке)"
                  placeholder="Сюда поместите код..."
                  value={this.state.style}
                  onChange={this.handleChange}
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
                  id="closed"
                  label="Закрыть(материал
                                будет доступен только автору)"
                  checked={this.state.closed}
                  onChange={this.handleChangeChecked}
                />
                <InputCheckBox
                  id="hidden"
                  label="Скрыть
                                из общих разделов(материал будет доступен по прямой ссылкуе и для прикрепления к другим
                                материалам)"
                  checked={this.state.hidden}
                  onChange={this.handleChangeChecked}
                />
                <InputCheckBox
                  id="comment"
                  label="Запретить
                                комментарии"
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

export default StoryCreate
