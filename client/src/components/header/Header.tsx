import React, {Component, forwardRef} from 'react'
import {Link} from "react-router-dom"
import './Header.scss'
import logo from './logo.png'
import Accordion from "../accordion/Accordion"
import history from "../../utils/history";

type IProps = {
    showMenu: boolean
    innerRef: any
    hideMenu: any
}

type S = {
    showStart: boolean
    showMaterial: boolean
    showHelp: boolean
}

class Header extends Component<IProps, S> {
    constructor(props: any) {
        super(props)
        this.state = {
            showStart: false,
            showMaterial: false,
            showHelp: false,
        }
    }

    toggleStart = () => {
        this.setState((state: S) => {
            return {
                showStart: !state.showStart
            }
        })

    }

    toggleMaterial = () => {
        this.setState((state: S) => {
            return {
                showMaterial: !state.showMaterial
            }
        })

    }

    toggleHelp = () => {
        this.setState((state: S) => {
            return {
                showHelp: !state.showHelp
            }
        })

    }

    handleClick = () => {

    }

    render() {
        console.log(history.location.pathname)
        return (
            <header ref={this.props.innerRef}
                    className={this.props.showMenu ? "fc header show" : "fc header"}>
                <div className="header-inner">
                    <Link onClick={this.props.hideMenu} className="fc logo" to="/"><img src={logo}
                                                                                        alt="Equilibrium"/></Link>
                    <div className={`header-item${history.location.pathname.includes('/start') ? ' item-active' : ''}`}
                         onClick={this.toggleStart}>
                        Начать игру
                    </div>
                    <Accordion isActive={this.state.showStart}>
                        <div onClick={this.props.hideMenu} className="header-sub">
                            <Link className={`header-item sub-item${history.location.pathname.includes('/reg') ? ' item-active' : ''}`} to="/reg">Регистрация</Link>
                            <Link className={`header-item sub-item${history.location.pathname.includes('/rule') ? ' item-active' : ''}`} to="/rule">Правила</Link>
                            <Link className={`header-item sub-item${history.location.pathname.includes('/how') ? ' item-active' : ''}`} to="/how">Как играть?</Link>
                        </div>
                    </Accordion>

                    <Link onClick={this.props.hideMenu}
                          className={`header-item${history.location.pathname.includes('/news') ? ' item-active' : ''}`}
                          to="/news">Новости</Link>

                    <div
                        className={`header-item${history.location.pathname.includes('/material') ? ' item-active' : ''}`}
                        onClick={this.toggleMaterial}>
                        Материалы
                    </div>
                    <Accordion isActive={this.state.showMaterial}>
                        <div onClick={this.props.hideMenu} className="header-sub">
                            <Link
                                className={`header-item sub-item${history.location.pathname.includes('/character') ? ' item-active' : ''}`}
                                to="/material/character">Персонажи</Link>
                            <Link
                                className={`header-item sub-item${history.location.pathname.includes('/guild') ? ' item-active' : ''}`}
                                to="/material/guild">Гильдии</Link>
                            <Link
                                className={`header-item sub-item${history.location.pathname.includes('/story') ? ' item-active' : ''}`}
                                to="/material/story">Сюжет</Link>
                            <Link
                                className={`header-item sub-item${history.location.pathname.includes('/report') ? ' item-active' : ''}`}
                                to="/material/report">Отчеты</Link>
                            <Link
                                className={`header-item sub-item${history.location.pathname.includes('/guid') ? ' item-active' : ''}`}
                                to="/material/guid">Гайды</Link>
                            <Link
                                className={`header-item sub-item${history.location.pathname.includes('/forum') ? ' item-active' : ''}`}
                                to="/material/forum">Форум</Link>
                        </div>
                    </Accordion>

                    <div className={`header-item${history.location.pathname.includes('/help') ? ' item-active' : ''}`}
                         onClick={this.toggleHelp}>
                        Помощь
                    </div>
                    <Accordion isActive={this.state.showHelp}>
                        <div onClick={this.props.hideMenu} className="header-sub">
                            <Link className="header-item sub-item" to="/ticket/type/list">Обратная связь</Link>
                        </div>
                    </Accordion>

                </div>
            </header>
        )
    }
}

export default forwardRef((props: any, ref: any) => <Header innerRef={ref} {...props}/>)