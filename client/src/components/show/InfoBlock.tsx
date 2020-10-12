import React from "react"
import styles from './InfoBlock.module.scss'

type P = {
    icon?: any,
    title: any,
    children: any
}

const InfoBlock = ({icon, title, children}: P) => {
    if (!children) {
        return null
    }
    if (!icon) {
        return (
            <div>
                <div className={styles.title}>{title}</div>
                <div className={styles.description}>{children}</div>
            </div>
        )
    }
    return (
        <div>
            <div className={styles.title}><img src={icon} alt=""/> {title}</div>
            <div className={styles.description}>{children}</div>
        </div>
    )
}

export default InfoBlock