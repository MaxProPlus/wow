import React from "react"
import './Comment.scss'
import AvatarImg from "../../../components/avatar-img/AvatarImg"
import {Link} from "react-router-dom"
import {Comment as CommentType} from "../../../../../server/src/common/entity/types"

type propsTypes = CommentType & {
    onClickRemove: any
}

export default function Comment(props: propsTypes) {
    return (
        <div className="fsb comment-item">
            <Link to={'/profile/' + props.idAccount}><AvatarImg url={props.authorUrlAvatar}/></Link>
            <div className="comment-block">
                <div className="comment-author"><Link to={'/profile/' + props.idAccount}>{props.authorNickname}</Link>
                </div>
                <div className="comment-text">{props.text}</div>
            </div>
        </div>
    )
}