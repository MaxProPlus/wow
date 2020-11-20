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

const Block = ({id, textTop = '', title = '', textBottom = '', textBottomRight = '', urlAvatar, size, href}: P) => {

    return (
        <Col className="material" lg={size}>
            <Link to={href + id}>
                <img src={urlAvatar} alt=""/>
                <div className="material__background"/>
                <div className="material__top">{textTop}</div>
                <div className="material__title">{title}</div>
                <div className="material__bottom">
                    <div className="material__bottom-left">{textBottom}</div>
                    <div className="material__bottom-right">{textBottomRight}</div>
                </div>
            </Link>
        </Col>
    )
}
export default Block