import React from 'react'
import {Link} from 'react-router-dom'
import UserContext from '../../contexts/userContext'
import Dropdown from 'components/dropdown/Dropdown'
import './HeaderTop.scss'
import menuImg from './img/menu-black-18dp.svg'
import signInImg from './img/signin.svg'
import signUpImg from './img/signup.svg'
import SearchInput from '../../components/list/SearchInput'
import history from '../../utils/history'

type P = {
  onClickMenu: () => void
}

type S = {
  title: string
}

class HeaderTop extends React.Component<P, S> {
  static contextType = UserContext

  constructor(props: P) {
    super(props)
    let title = new URLSearchParams(window.location.search).get('title')
    this.state = {
      title: title || '',
    }
  }

  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      title: e.target.value,
    })
  }

  handleSubmit = (
    e:
      | React.FormEvent<HTMLFormElement>
      | React.MouseEvent<HTMLImageElement, globalThis.MouseEvent>
  ) => {
    e.preventDefault()
    history.push({
      pathname: '/material/search',
      search: '?title=' + this.state.title,
    })
  }

  render() {
    const $profile =
      this.context.user.id <= 0 ? (
        <div className="header-top__sign">
          <Link to="/login">
            <span>Войти</span>
            <img className="header-top__icon" src={signInImg} alt="" />
          </Link>
          <Link to="/signup">
            <span>Регистрация</span>
            <img className="header-top__icon" src={signUpImg} alt="" />
          </Link>
        </div>
      ) : (
        <Dropdown />
      )
    return (
      <header className="header-top">
        <div className="header-top__inner">
          <div className="header-top__menu" onClick={this.props.onClickMenu}>
            <img src={menuImg} alt="" />
          </div>
          <SearchInput
            id="title"
            value={this.state.title}
            onChange={this.handleChange}
            onSubmit={this.handleSubmit}
            placeholder="Введите название любого материала или предмета"
          />
          {$profile}
        </div>
      </header>
    )
  }
}

export default HeaderTop
