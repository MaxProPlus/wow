import React from 'react'
import AvatarImg from '../../components/avatar-img/AvatarImg'
import './Profile.scss'
import history from '../../utils/history'
import {User} from '../../../../server/src/common/entity/types'

type P = User & {
    children?: React.ReactNode
    onClick?: () => void
}

export default React.forwardRef((props: P, ref: any) => {
    let handleClick = () => {
        history.push('/profile/' + props.id)
    }
    return (
        <div ref={ref} onClick={props.onClick ? props.onClick : handleClick} className="profile">
            <AvatarImg url={props.urlAvatar}/>
            <div className="nickname">{props.nickname}</div>
            {props.children}
        </div>
    )
})