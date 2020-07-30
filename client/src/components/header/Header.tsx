import React, {Component, forwardRef} from 'react'
import {Link} from "react-router-dom"
import './Header.scss'
import logo from './logo.png'

type IProps = {
    showMenu: boolean
    innerRef: any
    hideMenu: any
}

class Header extends Component<IProps, {}> {
    render() {
        return (
            <header onClick={this.props.hideMenu} ref={this.props.innerRef}
                    className={this.props.showMenu ? "fc header show" : "fc header"}>
                <div className={"header-inner"}>
                    <Link className="fc logo" to="/"><img src={logo} alt="Equilibrium"/></Link>
                    <Link className="header-item" to="/start">Начать игру</Link>
                    <Link className="header-item" to="/news">Новости</Link>
                    <Link className="header-item" to="/material">Материалы</Link>
                    <Link className="header-item" to="/ticket/type/list">Помощь</Link>
                </div>
            </header>
        )
    }
}

export default forwardRef((props: any, ref: any) => <Header innerRef={ref} {...props}/>)