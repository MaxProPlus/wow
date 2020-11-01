import React from 'react'
import {Col, Row} from 'react-bootstrap'
import {Link} from 'react-router-dom'
import styles from './BlockReport.module.scss'


type P = {
    className?: string,
    href: string,
    id: number,
    urlAvatar: string,
    title: string,
    muteTitle: string,
}

const BlockReport = ({className, id, title, muteTitle, urlAvatar, href}: P) => {

    return (
        <Row className={`${styles.block} ${className || ''}`}>
            <Col xs={3}>
                <Link to={href + id}>
                    <img src={urlAvatar} alt=""/>
                </Link>
            </Col>
            <Col xs={9}>
                <Link to={href + id}>
                    <div className={styles.title}>{title}</div>
                    <div className={styles.muteTitle}>{muteTitle}</div>
                </Link>
            </Col>
        </Row>
    )
}
export default BlockReport