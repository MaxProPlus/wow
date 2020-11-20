import React from 'react'
import {Col, Row} from 'react-bootstrap'
import {Link} from 'react-router-dom'
import './BlockReport.scss'

type P = {
    className?: string,
    href: string,
    id: number,
    urlAvatar: string,
    title: React.ReactNode,
    muteTitle?: string,
    bottomText?: React.ReactNode,
    bottomRightText?: React.ReactNode,
}

const BlockReport = ({className = '', id, title, muteTitle = '', bottomText, bottomRightText, urlAvatar, href}: P) => {

    return (
        <Row className={`material-fluid ${className}`}>
            <Col md={3}>
                <Link to={href + id}>
                    <img src={urlAvatar} alt=""/>
                </Link>
            </Col>
            <Col className="material-fluid__body" md={9}>
                <Link className="material-fluid__title" to={href + id}>{title}</Link>
                <div className="material-fluid__muteTitle">{muteTitle}</div>
                <div className="material-fluid__body-bottom">
                    <div className="material-fluid__bottom-text">{bottomText}</div>
                    <div className="material-fluid__bottom-right-text">{bottomRightText}</div>
                </div>
            </Col>
        </Row>
    )
}
export default BlockReport