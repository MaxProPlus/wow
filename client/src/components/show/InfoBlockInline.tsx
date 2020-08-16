import React from "react"
import {Col, Row} from "react-bootstrap"
import styles from './InfoBlockInline.module.scss'

type P = {
    icon: any,
    title: string,
    value: string | number
}

const InfoBlockInline = ({icon, title, value}: P) => {
    return (
        <Row className={styles.block}>
            <Col xs={4}>
                <img src={icon} alt=""/>
                {title}
            </Col>
            <Col className={styles.value} xs={8}>
                {value}
            </Col>
        </Row>
    )
}

export default InfoBlockInline