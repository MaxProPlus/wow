import React from 'react'
import {RouteProps} from '../../types/RouteProps'
import {CommonS, handleFormData} from './Common'
import UserContext from '../../contexts/userContext'
import Validator from '../../../../server/src/common/validator'
import {Article} from '../../../../server/src/common/entity/types'
import {Redirect, RouteComponentProps} from 'react-router-dom'
import Helper from '../../utils/helper'
import Spinner from '../../components/spinner/Spinner'
import PageTitle from '../../components/pageTitle/PageTitle'
import Form from '../../components/form/Form'
import AlertDanger from '../../components/alertDanger/AlertDanger'
import {Col, Row} from 'react-bootstrap'
import MyCropper from '../../components/myCropper/MyCropper'
import InputField from '../../components/form/inputField/InputField'
import Textarea from '../../components/form/textarea/Textarea'
import InputCheckBox from '../../components/form/inputCheckBox/InputCheckBox'
import Button from '../../components/button/Button'
import ArticleApi from '../../api/ArticleApi'
import Page from '../../components/page/Page'
import {Rights} from '../../../../server/src/providers/right'
import default260x190 from 'img/default260x190.png'

type P = RouteComponentProps & RouteProps

class ArticleCreate extends React.Component<P, CommonS> {
  static contextType = UserContext
  private articleApi = new ArticleApi()
  private validator = new Validator()
  private avatar: File | null = null

  constructor(props: P) {
    super(props)
    this.state = {
      ...new Article(),
      isLoaded: true,
      errorMessage: '',
    }
  }

  handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    this.setState({
      errorMessage: '',
      [e.target.id]: e.target.value,
    } as any)
  }

  handleChangeChecked = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    let article = (this.state as any) as Article
    let err = this.validator.validateArticle(article)
    // err += this.validator.validateImg(this.avatar)
    if (!!err) {
      this.props.scrollTop()
      this.setState({
        errorMessage: err,
        isLoaded: true,
      })
      return
    }
    let formData = handleFormData(article, this.avatar!)

    this.articleApi
      .create(formData)
      .then(
        (r) => {
          this.props.history.push('/article/' + r)
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
    if (
      this.context.user.id > 0 &&
      !this.context.user.rights.includes(Rights.ARTICLE_MODERATOR)
    ) {
      return (
        <Page>
          <AlertDanger>Нет прав</AlertDanger>
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
          <PageTitle className="mb-0" title="Создание новости" />
          <Form onSubmit={this.handleSubmit}>
            <AlertDanger>{this.state.errorMessage}</AlertDanger>
            <Row>
              <Col md={6}>
                <MyCropper
                  label="Загрузите изображение новости"
                  src={default260x190}
                  ratio={260 / 190}
                  onChange={this.handleImageChange}
                />
              </Col>
              <Col md={6}>
                <h2 className="page-edit__subtitle">Главное</h2>
                <InputField
                  id="title"
                  label="Заголовок новости"
                  placeholder="Введите название новости"
                  type="text"
                  value={this.state.title}
                  onChange={this.handleChange}
                />
                <Textarea
                  id="shortDescription"
                  label="Анонс"
                  placeholder="Введите анонс новости"
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
                  label="Описание новости"
                  placeholder="Опишите вашу новость..."
                  value={this.state.description}
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

export default ArticleCreate
