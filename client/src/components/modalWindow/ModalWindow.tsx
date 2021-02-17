import React from 'react'
import styles from './ModalWindow.module.scss'

type P = {
    title: string
    show: boolean
    children: React.ReactNode
}

const ModalWindow: React.FC<P> = ({title, children, show}) => {
    if (!show) {
        return null
    }
    return (
        <div className={styles.wrapper}>
            <div className={styles.window}>
                <div className={styles.title}>{title}</div>
                {children}
            </div>
        </div>
    )
}

export default ModalWindow

