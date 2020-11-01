import React from 'react'
import {Link} from 'react-router-dom'

type P = {
    className?: string
    id: number
    href: string
    urlAvatar: string
    title: string
    muteTitle: string
    children?: React.ReactNode
}

const Slide: React.FC<P> = ({className, id, href, urlAvatar, title, muteTitle, children}: P) => {
    return (
        <div className={`slider__item ${className || ''}`}>
            <Link to={href + id} className="slider-item">
                <img src={urlAvatar} alt="" className="slider-item__img"/>
                <div className="slider-item__bg"/>
                <div className="slider-item__anons">{muteTitle}</div>
                <div className="slider-item__title">{title}</div>
                {children}
            </Link>
        </div>
    )
}

export default Slide