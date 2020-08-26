import React from "react"
import styles from './ModalWindow.module.scss'

type P = {
    title: string
    show: boolean
    children: any
}

const ModalWindow = ({title, children, show}: P) => {
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

