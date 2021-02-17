import React from 'react'
import {Col, Row} from 'react-bootstrap'
import styles from './InfoBlockInline.module.scss'

type P = {
    icon: string,
    title: string,
    value: string | number
}

const InfoBlockInline: React.FC<P> = ({icon, title, value}) => {
    if (!value) {
        return null
    }
    return (
        <Row className={styles.block}>
            <Col xs={5}>
                <div className={styles.img}><img src={icon} alt=""/></div>
                <span className="title">{title}</span>
            </Col>
            <Col className={styles.value} xs={7}>
                {value}
            </Col>
        </Row>
    )
}

export default InfoBlockInline