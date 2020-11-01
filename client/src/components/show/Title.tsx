import React from 'react'
import styles from './Title.module.scss'

type P = {
    children: any
    className?: string
}

const Title = (props: P) => {
    return (
        <div className={`${styles.title} ${props.className}`}>{props.children}</div>
    )
}

export default Title