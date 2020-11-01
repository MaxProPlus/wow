import React from 'react'
import styles from './Button.module.scss'
import {Link} from 'react-router-dom'

export default (props: any) => {
    let className = styles.btn
    if (props.className) {
        className += ' ' + props.className
    }
    if (!!props.block) {
        className += ' ' + styles.btnBlock
    }
    let Tag: any = (!!props.to) ? Link : 'button'
    if (!!props.as) {
        Tag = props.as
    }
    return (
        <Tag {...props} className={className}>{props.children}</Tag>
    )
}