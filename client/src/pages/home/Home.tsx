import React from 'react'
import Spinner from '../../components/spinner/Spinner'
import {RouteComponentProps} from 'react-router-dom'
import Page from '../../components/page/Page'
import './Home.scss'
import Slide from './Slide'
import {Article} from '../../../../server/src/common/entity/types'
import ArticleApi from '../../api/ArticleApi'
import prevIcon from './img/prev.svg'
import nextIcon from './img/next.svg'

type P = RouteComponentProps

type S = {
    isLoaded: boolean
    article: Article[]
    currentArticle: number
}

class Home extends React.Component<P, S> {
    private articleApi = new ArticleApi()

    constructor(props: P) {
        super(props)
        this.state = {
            isLoaded: false,
            article: [],
            currentArticle: 0,
        }
    }

    componentDidMount() {
        this.articleApi.getAll({}, 5, 1).then(r => {
            this.setState({
                article: r.data,
                isLoaded: true,
            })
        }, err => {
            this.setState({
                isLoaded: true,
            })
            console.error(err)
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
                <Slide className="slider__item-active" id={this.state.article[this.state.currentArticle].id}
                       title={this.state.article[this.state.currentArticle].title} href="/article/"
                       urlAvatar={this.state.article[this.state.currentArticle].urlAvatar}
                       muteTitle={this.state.article[this.state.currentArticle].shortDescription}>
                    <div className="prev" onClick={this.prev}><img src={prevIcon} alt=""/></div>
                    <div className="next" onClick={this.next}><img src={nextIcon} alt=""/></div>
                </Slide>)
        }

        return (
            <>
                {!this.state.isLoaded && <Spinner/>}
                <h1 className="home__title">Добро пожаловать на <span className="color-3">Equilibrium</span> -
                    русскоязычной ролевой проект World of Warcraft</h1>
                <Page>
                    <div className="home__top">
                        {this.state.article.length > 0 &&
                        <div className="home__slider">
                            <div className="slider">
                                <div className="slider__list">
                                    {this.state.article.map(el =>
                                        <Slide key={el.id} id={el.id} title={el.title} href="/article/"
                                               urlAvatar={el.urlAvatar}
                                               muteTitle={el.shortDescription}/>,
                                    )}
                                </div>
                                {currentSlide}
                            </div>
                        </div>}
                        <div className="home__about">

                        </div>
                    </div>
                </Page>
            </>
        )
    }
}

export default Home