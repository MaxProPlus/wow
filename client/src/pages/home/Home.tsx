import React from 'react'
import Spinner from '../../components/spinner/Spinner'
import {Link, RouteComponentProps} from 'react-router-dom'
import Page from '../../components/page/Page'
import './Home.scss'
import Slide from './Slide'
import {Article} from '../../../../server/src/common/entity/types'
import ArticleApi from '../../api/ArticleApi'
import prevIcon from './img/prev.svg'
import nextIcon from './img/next.svg'
import aboutIcon from './img/about.svg'
import onlineIcon from './img/online.svg'
import vkIcon from './img/vk.svg'

type P = RouteComponentProps

type S = {
  isLoaded: boolean
  article: Article[]
  currentArticle: number
  maxHeight: string
}

class Home extends React.Component<P, S> {
  private articleApi = new ArticleApi()

  constructor(props: P) {
    super(props)
    this.state = {
      isLoaded: false,
      article: [],
      currentArticle: 0,
      maxHeight: '400px',
    }
  }

  componentDidMount() {
    this.articleApi.getAll({}, 5, 1).then(
      (r) => {
        this.setState({
          article: r.data,
          isLoaded: true,
        })
      },
      (err) => {
        this.setState({
          isLoaded: true,
        })
        console.error(err)
      }
    )
  }

  updateHeight = (height: number) => {
    this.setState({
      maxHeight: height + 'px',
    })
  }

  next = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    this.setState((state) => {
      if (state.currentArticle + 1 >= state.article.length) {
        return {
          currentArticle: 0,
        }
      }
      return {
        currentArticle: state.currentArticle + 1,
      }
    })
    e.preventDefault()
  }

  prev = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    this.setState((state) => {
      if (state.currentArticle - 1 < 0) {
        return {
          currentArticle: state.article.length - 1,
        }
      }
      return {
        currentArticle: state.currentArticle - 1,
      }
    })
    e.preventDefault()
  }

  render() {
    let currentSlide = null
    if (this.state.article.length > 0) {
      currentSlide = (
        <Slide
          className="slider__item-active"
          id={this.state.article[this.state.currentArticle].id}
          title={this.state.article[this.state.currentArticle].title}
          href="/article/"
          urlAvatar={this.state.article[this.state.currentArticle].urlAvatar}
          muteTitle={
            this.state.article[this.state.currentArticle].shortDescription
          }
          updateHeight={this.updateHeight}
          style={{maxHeight: this.state.maxHeight}}
        >
          <div className="prev" onClick={this.prev}>
            <img src={prevIcon} alt="" />
          </div>
          <div className="next" onClick={this.next}>
            <img src={nextIcon} alt="" />
          </div>
        </Slide>
      )
    }

    return (
      <>
        {!this.state.isLoaded && <Spinner />}
        <h1 className="home__title">
          Добро пожаловать на <span className="color-3">Equilibrium</span> -
          русскоязычной ролевой проект World of Warcraft
        </h1>
        <Page>
          <div className="home__top">
            {this.state.article.length > 0 && (
              <div className="home__slider">
                <div className="slider">
                  <div
                    className="slider__list"
                    style={{maxHeight: this.state.maxHeight}}
                  >
                    {this.state.article.map((el) => (
                      <Slide
                        key={el.id}
                        id={el.id}
                        title={el.title}
                        href="/article/"
                        urlAvatar={el.urlAvatar}
                        muteTitle={el.shortDescription}
                      />
                    ))}
                  </div>
                  {currentSlide}
                </div>
              </div>
            )}
            <div className="home__info">
              <Widget className="widget_about" icon={aboutIcon}>
                О проекте
              </Widget>
              <Widget className="widget_online" icon={onlineIcon}>
                Онлайн
              </Widget>
              <Widget className="widget_vk" icon={vkIcon}>
                Мы в вк
              </Widget>
            </div>
          </div>
        </Page>
      </>
    )
  }
}

type WidgetP = {
  className?: string
  icon: any
  href?: string
  children: React.ReactNode
}
const Widget: React.FC<WidgetP> = ({
  className = '',
  icon,
  href = '#',
  children,
}: WidgetP) => {
  return (
    <Link to={href} className={`widget ${className}`}>
      <img src={icon} alt="" />
      <span>{children}</span>
    </Link>
  )
}

export default Home
