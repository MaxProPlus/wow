import React from 'react'
import './AvatarImg.scss'

type P = {
  url: string
}

const AvatarImg: React.FC<P> = (props) => {
  return (
    <div className="avatar_img">
      <img src={props.url} alt="" />
    </div>
  )
}

export default AvatarImg
