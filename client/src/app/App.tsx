import React from 'react'
import {Router} from 'react-router-dom'
import './App.scss'
import '../css/styles.scss'
import history from 'utils/history'
import UserApi from 'api/UserApi'
import UserContext from 'contexts/userContext'
import {User} from '../../../server/src/common/entity/types'
import HeaderTop from './headerTop/HeaderTop'
import Routes from './Routes'
import Cookie from '../utils/cookie'
import HeaderLeft from './headerLeft/HeaderLeft'

type S = {
  isLoaded: boolean
  showMenu: boolean
  user: User
}

class App extends React.Component<{}, S> {
  private userApi = new UserApi()
  private wrapperRef?: HTMLHeadingElement
  private containerRef?: HTMLElement

  constructor(props: {}) {
    super(props)
    this.state = {
      isLoaded: false,
      showMenu: false,
      user: new User(),
    }
  }

  /**
   * Авторизация по токену
   */
  updateLogin = () => {
    let token = Cookie.getCookie('token')
    if (!token) {
      this.setState({
        user: {
          ...new User(),
          id: -1,
        },
      })
      return
    }
    return this.userApi.getContext().then(
      (user) => {
        this.setState((state) => {
          return {
            user: {
              ...state.user,
              ...user,
            },
          }
        })
      },
      () => {
        this.setState({
          user: {
            ...new User(),
            id: -1,
          },
        })
      }
    )
  }

  componentDidMount() {
    this.updateLogin()
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside)
  }

  handleClickOutside = (e: MouseEvent) => {
    if (this.wrapperRef && !this.wrapperRef.contains(e.target as Node)) {
      this.hideMenu()
      document.removeEventListener('mousedown', this.handleClickOutside)
    }
  }

  handleToggleMenu = () => {
    this.setState({showMenu: true})
    document.addEventListener('mousedown', this.handleClickOutside)
  }

  hideMenu = () => {
    this.setState({showMenu: false})
  }

  scrollTop = () => {
    if (!!this.containerRef) {
      this.containerRef.scrollTo(0, 0)
    }
  }

  setWrapperRef = (node: HTMLHeadingElement) => {
    this.wrapperRef = node
  }

  setContainerRef = (node: HTMLDivElement) => {
    this.containerRef = node
  }

  render() {
    return (
      <Router history={history}>
        <UserContext.Provider
          value={{user: this.state.user, updateLogin: this.updateLogin}}
        >
          <div className="app">
            <HeaderLeft
              ref={this.setWrapperRef}
              showMenu={this.state.showMenu}
              hideMenu={this.hideMenu}
            />
            <div ref={this.setContainerRef} className="app__body">
              <HeaderTop onClickMenu={this.handleToggleMenu} />
              <div className="app-body__content">
                <div className="content">
                  <Routes scrollTop={this.scrollTop} />
                </div>
              </div>
            </div>
          </div>
        </UserContext.Provider>
      </Router>
    )
  }
}

export default App
