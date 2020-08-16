import React from "react"
import styles from './SubTitle.module.scss'

type P = {
    children: any
}

const SubTitle = (props: P) => {
    return (
        <div className={styles.title}>{props.children}</div>
    )
}

export default SubTitle