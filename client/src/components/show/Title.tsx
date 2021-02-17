import React from 'react'
import styles from './Title.module.scss'

type P = {
    children: React.ReactNode
    className?: string
}

const Title: React.FC<P> = (props) => {
    return (
        <div className={`${styles.title} ${props.className}`}>{props.children}</div>
    )
}

export default Title