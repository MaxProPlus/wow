import React from 'react'
import styles from './SubTitle.module.scss'

type P = {
    children: any
    className?: string
}

const SubTitle = (props: P) => {
    return (
        <div className={`${styles.title} ${props.className}`}>{props.children}</div>
    )
}

export default SubTitle