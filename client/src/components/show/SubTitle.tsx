import React from 'react'
import styles from './SubTitle.module.scss'

type P = {
    children: React.ReactNode
    className?: string
}

const SubTitle: React.FC<P> = (props) => {
    return (
        <div className={`${styles.title} ${props.className}`}>{props.children}</div>
    )
}

export default SubTitle