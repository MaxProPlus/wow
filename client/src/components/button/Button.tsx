import React from "react"
import './Button.scss'

export default (props: any) => {
    let className = 'btn'
    if (props.className) {
        className += ' ' + props.className
    }
    return (
        <button {...props} className={className}>{props.children}</button>
    )
}