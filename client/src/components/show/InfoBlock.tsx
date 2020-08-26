import React from "react"
import styles from './InfoBlock.module.scss'

type P = {
    title: string,
    value: string
}

const InfoBlock = ({title, value}: P) => {
    if (!value) {
        return null
    }
    return (
        <div>
            <div className={styles.title}>{title}</div>
            <div className={styles.description}>{value}</div>
        </div>
    )
}

export default InfoBlock