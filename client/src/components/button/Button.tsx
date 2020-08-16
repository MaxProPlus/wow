import React from "react"
import styles from './Button.module.scss'
import {Link} from "react-router-dom"

export default (props: any) => {
    let className = styles.btn
    if (props.className) {
        className += ' ' + props.className
    }
    const Tag: any = (!!props.to) ? Link : 'button'
    if (props.to) {

    }
    return (
        <Tag {...props} className={className}>{props.children}</Tag>
    )
}