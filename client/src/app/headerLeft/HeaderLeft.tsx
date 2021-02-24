import React, {Component, forwardRef} from 'react'
import {Link} from 'react-router-dom'
import styles from './HeaderLeft.module.scss'
import logo from './logo.png'
import history from '../../utils/history'
import Accordion from '../../components/accordion/Accordion'
import {UnregisterCallback} from 'history'

type P = {
  showMenu: boolean
  innerRef: React.RefCallback<HTMLHeadingElement>
  hideMenu: () => void
}

type S = {
  showStart: boolean
  showMaterial: boolean
  showHelp: boolean
  path: string
}

class HeaderLeft extends Component<P, S> {
  private removeListen?: UnregisterCallback

  constructor(props: P) {
    super(props)
    this.state = {
      showStart: false,
      showMaterial: false,
      showHelp: false,
      path: history.location.pathname,
    }
  }

  componentDidMount() {
    this.removeListen = history.listen((location) => {
      this.setState({
        path: location.pathname,
      })
    })
  }

  componentWillUnmount() {
    this.removeListen!()
  }

  toggleStart = () => {
    this.setState((state: S) => {
      return {
        showStart: !state.showStart,
        showMaterial: false,
        showHelp: false,
      }
    })
  }

  toggleMaterial = () => {
    this.setState((state: S) => {
      return {
        showMaterial: !state.showMaterial,
        showStart: false,
        showHelp: false,
      }
    })
  }

  toggleHelp = () => {
    this.setState((state: S) => {
      return {
        showHelp: !state.showHelp,
        showStart: false,
        showMaterial: false,
      }
    })
  }

  render() {
    return (
      <header
        ref={this.props.innerRef}
        className={
          this.props.showMenu
            ? `${styles.header} ${styles.show}`
            : styles.header
        }
      >
        <div className={styles.inner}>
          <Link onClick={this.props.hideMenu} className={styles.logo} to="/">
            <img src={logo} alt="Equilibrium" />
          </Link>
          <div
            className={`${styles.item}${
              this.state.path.includes('/start') ? ` ${styles.active}` : ''
            }`}
            onClick={this.toggleStart}
          >
            Начать игру
          </div>
          <Accordion
            className={styles.accordion}
            isActive={this.state.showStart}
          >
            <div onClick={this.props.hideMenu} className={styles.subHeader}>
              <Link
                className={`${styles.item} ${styles.subItem}${
                  this.state.path.includes('/reg') ? ` ${styles.active}` : ''
                }`}
                to="/start/reg"
              >
                Регистрация
              </Link>
              <Link
                className={`${styles.item} ${styles.subItem}${
                  this.state.path.includes('/how') ? ` ${styles.active}` : ''
                }`}
                to="/start/how"
              >
                Как играть?
              </Link>
              <Link
                className={`${styles.item} ${styles.subItem}${
                  this.state.path.includes('/rule') ? ` ${styles.active}` : ''
                }`}
                to="/start/rule"
              >
                Правила
              </Link>
            </div>
          </Accordion>

          <Link
            onClick={this.props.hideMenu}
            className={`${styles.item}${
              this.state.path.includes('/article') ? ` ${styles.active}` : ''
            }`}
            to="/article"
          >
            Новости
          </Link>

          <div
            className={`${styles.item}${
              this.state.path.includes('/material') ? ` ${styles.active}` : ''
            }`}
            onClick={this.toggleMaterial}
          >
            Материалы
          </div>
          <Accordion
            className={styles.accordion}
            isActive={this.state.showMaterial}
          >
            <div onClick={this.props.hideMenu} className={styles.subHeader}>
              <Link
                className={`${styles.item} ${styles.subItem}${
                  this.state.path.includes('/character')
                    ? ` ${styles.active}`
                    : ''
                }`}
                to="/material/character"
              >
                Персонажи
              </Link>
              <Link
                className={`${styles.item} ${styles.subItem}${
                  this.state.path.includes('/guild') ? ` ${styles.active}` : ''
                }`}
                to="/material/guild"
              >
                Гильдии
              </Link>
              <Link
                className={`${styles.item} ${styles.subItem}${
                  this.state.path.includes('/story') ? ` ${styles.active}` : ''
                }`}
                to="/material/story"
              >
                Сюжет
              </Link>
              <Link
                className={`${styles.item} ${styles.subItem}${
                  this.state.path.includes('/report') ? ` ${styles.active}` : ''
                }`}
                to="/material/report"
              >
                Отчеты
              </Link>
              <Link
                className={`${styles.item} ${styles.subItem}${
                  this.state.path.includes('/forum') ? ` ${styles.active}` : ''
                }`}
                to="/material/forum"
              >
                Форум
              </Link>
            </div>
          </Accordion>

          <div
            className={`${styles.item}${
              this.state.path.includes('/help') ? ` ${styles.active}` : ''
            }`}
            onClick={this.toggleHelp}
          >
            Помощь
          </div>
          <Accordion
            className={styles.accordion}
            isActive={this.state.showHelp}
          >
            <div onClick={this.props.hideMenu} className={styles.subHeader}>
              <Link
                className={`${styles.item} ${styles.subItem}${
                  this.state.path.includes('/guid') ? ` ${styles.active}` : ''
                }`}
                to="/help/guid"
              >
                Гайды
              </Link>
              <Link
                className={`${styles.item} ${styles.subItem}${
                  this.state.path.includes('/ticket') ? ` ${styles.active}` : ''
                }`}
                to="/help/ticket/type"
              >
                Тикеты
              </Link>
              <Link
                className={`${styles.item} ${styles.subItem}${
                  this.state.path.includes('/trans') ? ` ${styles.active}` : ''
                }`}
                to="/help/trans"
              >
                Трансмогрификация
              </Link>
              <Link
                className={`${styles.item} ${styles.subItem}${
                  this.state.path.includes('/feedback')
                    ? ` ${styles.active}`
                    : ''
                }`}
                to="/help/feedback"
              >
                Обратная связь
              </Link>
            </div>
          </Accordion>
        </div>
      </header>
    )
  }
}

export default forwardRef((props: any, ref: any) => (
  <HeaderLeft innerRef={ref} {...props} />
))
