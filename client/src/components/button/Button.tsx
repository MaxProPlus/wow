import React from "react"
import './Button.scss'

export default (props: any) => {
    const className = 'btn ' + (!!props.className?props.className : '')
    return (
        <button {...props} className={className}>{props.children}</button>
    )
}