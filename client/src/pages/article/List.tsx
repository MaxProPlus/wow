import React, {ChangeEvent, Component} from 'react'
import {RouteComponentProps} from 'react-router-dom'
import {Article} from '../../../../server/src/common/entity/types'
import AlertDanger from '../../components/alert-danger/AlertDanger'
import Button from '../../components/button/Button'
import Spinner from '../../components/spinner/Spinner'
import PageTitle from '../../components/pageTitle/PageTitle'
import BlockReport from '../../components/list/BlockReport'
import ArticleApi from '../../api/ArticleApi'
import penIcon from '../../img/pen.svg'
import UserContext from '../../contexts/userContext'
import './List.scss'
import stylesTitle from '../../css/listTitle.module.scss'
import stylesButton from '../../components/list/SearchBlock.module.scss'
import DateFormatter from '../../utils/date'

type P = RouteComponentProps

type S = {
  isLoaded: boolean
  errorMessage: string
  count: number
  list: Article[]
}

class ArticleList extends Component<P, S> {
  static contextType = UserContext
  private articleApi = new ArticleApi()
  private page = 1
  private limit = 10

  constructor(props: P) {
    super(props)
    this.state = {
      isLoaded: false,
      errorMessage: '',
      count: 0,
      list: [],
    }
  }

  componentDidMount() {
    this.updateData(false)
  }

  updateData = (reset: boolean) => {
    this.articleApi
      .getAll({}, this.limit, this.page)
      .then(
        (r) => {
          if (reset) {
            this.setState({
              list: r.data,
              count: r.count,
            })
          } else {
            this.setState((prevState: S) => {
              return {
                list: prevState.list.concat(r.data),
                count: r.count,
              }
            })
          }
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

  handlePageClick = () => {
    this.setState({
      isLoaded: false,
    })
    this.page += 1
    this.updateData(false)
  }

  handleChange = (e: ChangeEvent<HTMLInputElement>) => {
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

  handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    this.page = 1
    this.setState({
      isLoaded: false,
    })
    this.updateData(true)
  }

  render() {
    if (!!this.state.errorMessage) {
      return <AlertDanger>{this.state.errorMessage}</AlertDanger>
    }
    const more =
      this.limit * this.page < this.state.count ? (
        <Button onClick={this.handlePageClick} className="more-btn">
          Загрузить еще
        </Button>
      ) : (
        ''
      )
    return (
      <div>
        {!this.state.isLoaded && <Spinner />}
        <PageTitle
          title="Последние обновления"
          className={`${stylesTitle.header} page-article-list__title`}
        >
          {this.context.user.rights.includes('ARTICLE_MODERATOR') && (
            <Button to="/article/create">
              <img className={stylesButton.icon} src={penIcon} alt="" />
              <span className={stylesButton.text}>Создать новость</span>
            </Button>
          )}
        </PageTitle>
        {this.state.list.length > 0
          ? this.state.list.map((el) => (
              <BlockReport
                className="material-fluid_article"
                key={el.id}
                id={el.id}
                title={el.title}
                muteTitle={el.shortDescription}
                bottomText={DateFormatter.format(el.createdAt)}
                urlAvatar={el.urlAvatar}
                href="/article/"
              />
            ))
          : 'Новости не найдены'}
        {more}
      </div>
    )
  }
}

export default ArticleList
