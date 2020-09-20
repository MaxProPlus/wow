import React, {Component, forwardRef} from 'react'
import {Link} from "react-router-dom"
import './Header.scss'
import logo from './logo.png'
import Accordion from "../accordion/Accordion"
import history from "../../utils/history"

type P = {
    showMenu: boolean
    innerRef: any
    hideMenu: any
}

type S = {
    showStart: boolean
    showMaterial: boolean
    showHelp: boolean
    path: string
}

class Header extends Component<P, S> {
    private removeListen: any

    constructor(props: any) {
        super(props)
        this.state = {
            showStart: false,
            showMaterial: false,
            showHelp: false,
            path: history.location.pathname,
        }
    }

    componentDidMount() {
        this.removeListen = history.listen(location => {
            this.setState({
                path: location.pathname
            })
        })
    }

    componentWillUnmount() {
        this.removeListen()
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
            <header ref={this.props.innerRef}
                    className={this.props.showMenu ? "fc header show" : "fc header"}>
                <div className="header-inner">
                    <Link onClick={this.props.hideMenu} className="fc logo" to="/"><img src={logo}
                                                                                        alt="Equilibrium"/></Link>
                    <div className={`header-item${this.state.path.includes('/start') ? ' item-active' : ''}`}
                         onClick={this.toggleStart}>
                        Начать игру
                    </div>
                    <Accordion isActive={this.state.showStart}>
                        <div onClick={this.props.hideMenu} className="header-sub">
                            <Link
                                className={`header-item sub-item${this.state.path.includes('/reg') ? ' item-active' : ''}`}
                                to="/reg">Регистрация</Link>
                            <Link
                                className={`header-item sub-item${this.state.path.includes('/rule') ? ' item-active' : ''}`}
                                to="/rule">Правила</Link>
                            <Link
                                className={`header-item sub-item${this.state.path.includes('/how') ? ' item-active' : ''}`}
                                to="/how">Как играть?</Link>
                        </div>
                    </Accordion>

                    <Link onClick={this.props.hideMenu}
                          className={`header-item${this.state.path.includes('/news') ? ' item-active' : ''}`}
                          to="/news">Новости</Link>

                    <div
                        className={`header-item${this.state.path.includes('/material') ? ' item-active' : ''}`}
                        onClick={this.toggleMaterial}>
                        Материалы
                    </div>
                    <Accordion isActive={this.state.showMaterial}>
                        <div onClick={this.props.hideMenu} className="header-sub">
                            <Link
                                className={`header-item sub-item${this.state.path.includes('/character') ? ' item-active' : ''}`}
                                to="/material/character">Персонажи</Link>
                            <Link
                                className={`header-item sub-item${this.state.path.includes('/guild') ? ' item-active' : ''}`}
                                to="/material/guild">Гильдии</Link>
                            <Link
                                className={`header-item sub-item${this.state.path.includes('/story') ? ' item-active' : ''}`}
                                to="/material/story">Сюжет</Link>
                            <Link
                                className={`header-item sub-item${this.state.path.includes('/report') ? ' item-active' : ''}`}
                                to="/material/report">Отчеты</Link>
                            <Link
                                className={`header-item sub-item${this.state.path.includes('/forum') ? ' item-active' : ''}`}
                                to="/material/forum">Форум</Link>
                        </div>
                    </Accordion>

                    <div className={`header-item${this.state.path.includes('/help') ? ' item-active' : ''}`}
                         onClick={this.toggleHelp}>
                        Помощь
                    </div>
                    <Accordion isActive={this.state.showHelp}>
                        <div onClick={this.props.hideMenu} className="header-sub">
                            <Link
                                className={`header-item sub-item${this.state.path.includes('/ticket') ? ' item-active' : ''}`}
                                to="/help/ticket/type">Тикеты</Link>
                        </div>
                    </Accordion>

                </div>
            </header>
        )
    }
}

export default forwardRef((props: any, ref: any) => <Header innerRef={ref} {...props}/>)