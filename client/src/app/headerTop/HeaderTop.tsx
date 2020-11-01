import React, {Component} from 'react'
import {Link} from 'react-router-dom'
import UserContext from '../../contexts/userContext'
import Dropdown from 'components/dropdown/Dropdown'
import './HeaderTop.scss'
import menuImg from './menu-black-18dp.svg'

type P = {
    onClickMenu: (e: any) => void
}

class HeaderTop extends Component<P, {}> {
    static contextType = UserContext

    render() {
        const $profile = (this.context.user.id <= 0) ? (
            <div className="profile"><Link to="/login">Вход</Link></div>) : (<Dropdown/>)
        return (
            <header className="fc header-top">
                <div className="fsb header-inner">
                    <div className="menu" onClick={this.props.onClickMenu}><img src={menuImg} alt=""/></div>
                    {$profile}
                </div>
            </header>
        )
    }
}

export default HeaderTop