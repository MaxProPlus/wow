import React from "react"
import {Col} from "react-bootstrap"
import {Link} from "react-router-dom"
import styles from './Block.module.scss'


type P = {
    href: string,
    size: number,
    id: number,
    urlAvatar: string,
    title: string,
    muteTitle: string,
}

const Block = ({id, title, muteTitle, urlAvatar, size, href}: P) => {

    return (
        <Col className={styles.block} lg={size}>
            <Link to={href + id}>
                <img src={urlAvatar} alt=""/>
                <div className={styles.background}/>
                <div className={styles.title}>{title}</div>
                <div className={styles.muteTitle}>{muteTitle}</div>
            </Link>
        </Col>
    )
}
export default Block