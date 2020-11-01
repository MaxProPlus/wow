import React from 'react'
import {Link} from 'react-router-dom'
import {Comment as CommentType} from '../../../../server/src/common/entity/types'
import AvatarImg from '../avatar-img/AvatarImg'
import './Comment.scss'

type propsTypes = CommentType & {
    onClickRemove?: any
}

export default function Comment(props: propsTypes) {
    return (
        <div className="comment-item">
            <div className="d-flex justify-content-between">
                <Link to={'/profile/' + props.idUser}><AvatarImg url={props.authorUrlAvatar}/></Link>
                <div className="flex-grow-1">
                    <div className="comment-author__nickname"><Link
                        to={'/profile/' + props.idUser}>{props.authorNickname}</Link>
                    </div>
                    {/*<div>{props.date}</div>*/}
                </div>
            </div>
            <div className="comment__text">{props.text}</div>
        </div>
    )
}