import React from 'react'
import {Col} from 'react-bootstrap'
import {Link} from 'react-router-dom'
import './Block.scss'


type P = {
    href: string,
    size: number,
    id: number,
    urlAvatar: string,
    textTop?: string,
    title?: string,
    textBottom?: string,
    textBottomRight?: string,
}

const Block: React.FC<P> = ({id, textTop = '', title = '', textBottom = '', textBottomRight = '', urlAvatar, size, href}) => {

    return (
        <Col className="material" lg={size}>
            <Link to={href + id}>
                <img src={urlAvatar} alt=""/>
                <div className="material__background"/>
                <div className="material__top text-truncate">{textTop}</div>
                <div className="material__title text-truncate">{title}</div>
                <div className="material__bottom">
                    <div className="text-truncate">{textBottom}</div>
                    <div className="material__bottom-right text-truncate">{textBottomRight}</div>
                </div>
            </Link>
        </Col>
    )
}
export default Block