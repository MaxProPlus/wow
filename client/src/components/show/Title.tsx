import React from "react"
import styles from './Title.module.scss'

type P = {
    children: any
}

const Title = (props: P) => {
    return (
        <div className={styles.title}>{props.children}</div>
    )
}

export default Title