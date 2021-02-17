import React from 'react'
import styles from './InfoBlock.module.scss'

type P = {
    icon?: string,
    title: string,
    children: React.ReactNode
}

const InfoBlock: React.FC<P> = ({icon, title, children}) => {
    if (!children) {
        return null
    }
    if (!icon) {
        return (
            <div>
                <h3>{title}</h3>
                <div className={styles.description}>{children}</div>
            </div>
        )
    }
    return (
        <div>
            <h3><img src={icon} alt=""/> {title}</h3>
            <div className={styles.description}>{children}</div>
        </div>
    )
}

export default InfoBlock