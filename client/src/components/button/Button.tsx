import React from 'react'
import styles from './Button.module.scss'
import {Link} from 'react-router-dom'

type P = {
    onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
    className?: string
    block?: boolean
    to?: string
    as?: React.ElementType
    children?: React.ReactNode
}

const Button: React.FC<P> = (props) => {
    let className = styles.btn
    if (props.className) {
        className += ' ' + props.className
    }
    if (!!props.block) {
        className += ' ' + styles.btnBlock
    }
    let Tag: React.ElementType = (!!props.to) ? Link : 'button'
    if (!!props.as) {
        Tag = props.as
    }
    return (
        <Tag {...props} className={className}>{props.children}</Tag>
    )
}

export default Button