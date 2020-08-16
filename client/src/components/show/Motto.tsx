import React from "react"
import styles from './Motto.module.scss'

type P = {
    children: any
}

const Motto = (props: P) => {
    return (
        <div className={styles.title}>{props.children}</div>
    )
}

export default Motto