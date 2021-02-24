import React, {Component} from 'react'
import UserContext from '../../contexts/userContext'
import UserApi from '../../api/UserApi'
import history from '../../utils/history'
import './Dropdown.scss'
import Profile from '../profile/Profile'
import {Link} from 'react-router-dom'

type S = {
  visible: boolean
}

class Dropdown extends Component<{}, S> {
  static contextType = UserContext
  userApi = new UserApi()
  wrapperRef?: HTMLElement

  constructor(props: {}) {
    super(props)
    this.state = {
      visible: false,
    }
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside)
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside)
  }

  handleClickOutside = (e: MouseEvent) => {
    if (this.wrapperRef && !this.wrapperRef.contains(e.target as Node)) {
      this.hideMenu()
    }
  }

  toggleMenu = () => {
    this.setState((state: S) => {
      return {visible: !state.visible}
    })
  }

  hideMenu = () => {
    this.setState({visible: false})
  }

  setWrapperRef = (node: HTMLElement) => {
    this.wrapperRef = node
  }

  logout = () => {
    this.userApi.logout().then(() => {
      this.context.updateLogin()
      history.push('/')
    })
  }

  renderMenu = () => {
    return (
      <div className="dropdown">
        <Link className="item" to={'/profile/' + this.context.user.id}>
          Мой профиль
        </Link>
        <Link className="item" to={'/setting'}>
          Настройки
        </Link>
        <div className="item" onClick={this.logout}>
          Выйти
        </div>
      </div>
    )
  }

  render() {
    const $menu = this.state.visible ? this.renderMenu() : null
    return (
      <Profile
        ref={this.setWrapperRef}
        {...this.context.user}
        onClick={this.toggleMenu}
      >
        {$menu}
      </Profile>
    )
  }
}

export default Dropdown
